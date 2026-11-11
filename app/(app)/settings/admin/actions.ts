"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser, saveFoodPreferences, saveHousehold } from "@/lib/data";
import { isDev } from "@/lib/dev";
import { DEFAULT_HOUSEHOLD_SIZE, DEFAULT_MEALS_PER_WEEK } from "@/lib/household";
import { createClient } from "@/lib/supabase/server";

/**
 * Sends the signed-in user back through first-time setup. With
 * intent=fresh it also clears their answers and meal plans, like a brand-new
 * account.
 */
export async function restartOnboarding(formData: FormData) {
  // Server actions can be called directly, so the page being hidden isn't enough.
  if (!isDev) throw new Error("Admin tools only run in local development.");

  const user = await requireUser();
  const supabase = await createClient();

  if (formData.get("intent") === "fresh") {
    const cleared = await saveFoodPreferences({
      dietaryRestrictions: [],
      cannotEat: [],
      dislikes: [],
      likes: [],
    });
    const reset = await saveHousehold({
      householdSize: DEFAULT_HOUSEHOLD_SIZE,
      mealsPerWeek: DEFAULT_MEALS_PER_WEEK,
    });
    // Their meals go with the plans.
    const plans = await supabase.from("meal_plans").delete().eq("user_id", user.sub);
    if (!cleared.ok || !reset.ok || plans.error) throw new Error("Couldn't clear your answers.");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ onboarded_at: null })
    .eq("id", user.sub);
  if (error) throw new Error(`Couldn't restart onboarding: ${error.message}`);

  // Drop pages the browser kept, like a deleted plan's recipes.
  revalidatePath("/", "layout");
  redirect("/onboarding");
}
