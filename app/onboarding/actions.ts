"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { onboardingSchema, type OnboardingInput } from "@/lib/onboarding";
import { createClient } from "@/lib/supabase/server";

const SAVE_FAILED = "We couldn't save your answers. Please try again.";

export async function saveOnboarding(input: OnboardingInput): Promise<{ error: string }> {
  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your answers." };
  }
  const answers = parsed.data;

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims.sub;
  if (!userId) redirect("/login");

  // Every write here is idempotent, so a retry after a partial failure is safe.
  const [householdResult, profileResult] = await Promise.all([
    supabase
      .from("households")
      .update({ size: answers.householdSize, dinners_per_week: answers.dinnersPerWeek })
      .eq("owner_id", userId)
      .select("id")
      .single(),
    supabase
      .from("profiles")
      .update({ display_name: answers.displayName })
      .eq("id", userId)
      .select("onboarded_at")
      .single(),
  ]);
  if (householdResult.error) return fail(householdResult.error);
  if (profileResult.error) return fail(profileResult.error);
  const household = householdResult.data;

  const [preferencesResult, existingResult] = await Promise.all([
    supabase
      .from("household_preferences")
      .update({
        cuisines: answers.cuisines,
        dietary_restrictions: answers.dietaryRestrictions,
        dislikes: unique(answers.dislikes),
        max_cook_minutes: answers.maxCookMinutes,
        cooking_confidence: answers.cookingConfidence,
        leftovers: answers.leftovers,
        budget: answers.budget,
      })
      .eq("household_id", household.id),
    supabase
      .from("pantry_items")
      .select("name, is_staple, use_soon")
      .eq("household_id", household.id),
  ]);
  if (preferencesResult.error) return fail(preferencesResult.error);
  if (existingResult.error) return fail(existingResult.error);

  // Sync pantry flags. Existing rows keep their have/low/out state; items the
  // user added elsewhere (no onboarding flags) are left alone.
  const wanted = new Map<string, { is_staple: boolean; use_soon: boolean }>();
  for (const name of answers.staples) wanted.set(name, { is_staple: true, use_soon: false });
  for (const name of answers.useSoon) {
    wanted.set(name, { is_staple: wanted.get(name)?.is_staple ?? false, use_soon: true });
  }

  const dropped = existingResult.data
    .filter((item) => (item.is_staple || item.use_soon) && !wanted.has(item.name))
    .map((item) => item.name);

  if (dropped.length > 0) {
    const { error } = await supabase
      .from("pantry_items")
      .delete()
      .eq("household_id", household.id)
      .in("name", dropped);
    if (error) return fail(error);
  }

  if (wanted.size > 0) {
    const { error } = await supabase.from("pantry_items").upsert(
      [...wanted].map(([name, flags]) => ({ household_id: household.id, name, ...flags })),
      { onConflict: "household_id,name" },
    );
    if (error) return fail(error);
  }

  const firstTime = !profileResult.data.onboarded_at;
  if (firstTime) {
    const { error } = await supabase
      .from("profiles")
      .update({ onboarded_at: new Date().toISOString() })
      .eq("id", userId);
    if (error) return fail(error);
  }

  revalidatePath("/dashboard");
  redirect(firstTime ? "/dashboard?welcome=1" : "/dashboard");
}

function unique(values: string[]) {
  return [...new Set(values)];
}

function fail(error: { message: string }) {
  console.error("saveOnboarding failed:", error.message);
  return { error: SAVE_FAILED };
}
