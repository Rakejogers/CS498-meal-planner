import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/** The signed-in user's verified JWT claims, or null. */
export const getUser = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return data?.claims ?? null;
});

export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

/** The signed-in user's profile, household, preferences, and pantry. */
export const getHousehold = cache(async () => {
  const user = await requireUser();
  const supabase = await createClient();

  const [profile, household] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, onboarded_at")
      .eq("id", user.sub)
      .maybeSingle(),
    supabase
      .from("households")
      .select(
        "id, size, dinners_per_week, household_preferences(*), pantry_items(name, state, is_staple, use_soon)",
      )
      .eq("owner_id", user.sub)
      .order("name", { referencedTable: "pantry_items" })
      .maybeSingle(),
  ]);

  if (profile.error) throw new Error(profile.error.message);
  if (household.error) throw new Error(household.error.message);

  // A valid session for a user that no longer exists (e.g. after `db:reset`).
  if (!profile.data || !household.data?.household_preferences) {
    redirect("/auth/signout");
  }

  const { household_preferences, pantry_items, ...rest } = household.data;

  return {
    email: user.email ?? "",
    profile: profile.data,
    household: rest,
    preferences: household_preferences,
    pantry: pantry_items,
  };
});

export type HouseholdData = Awaited<ReturnType<typeof getHousehold>>;
