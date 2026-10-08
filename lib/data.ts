import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { knownRestrictions, type FoodPreferences } from "@/lib/preferences";
import { createClient } from "@/lib/supabase/server";

// Data access layer: every server-side read of user data goes through here, so
// the auth check can't be forgotten. Writes shared by more than one route live
// here too. Wrap loaders in `cache` so a layout and a
// page asking for the same thing share one request.

/** The signed-in user's verified JWT claims, or null. */
export const getUser = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return data?.claims ?? null;
});

/** The signed-in user's claims. Sends signed-out visitors to /login. */
export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

/** The signed-in user's profile. */
export const getProfile = cache(async () => {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("display_name, onboarded_at")
    .eq("id", user.sub)
    .maybeSingle();

  if (error) throw new Error(error.message);

  // A valid session for a user that no longer exists (e.g. after `db:reset`).
  if (!data) redirect("/auth/signout");

  return {
    email: user.email ?? "",
    displayName: data.display_name,
    /** False until the user finishes (or skips) first-time setup. */
    onboarded: data.onboarded_at !== null,
  };
});

export type Profile = Awaited<ReturnType<typeof getProfile>>;

/**
 * What the signed-in user likes, dislikes, and can't eat. Empty lists until
 * they save some. Meal planning should read preferences from here.
 */
export const getFoodPreferences = cache(async (): Promise<FoodPreferences> => {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("food_preferences")
    .select("dietary_restrictions, cannot_eat, dislikes, likes")
    .eq("user_id", user.sub)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return {
    dietaryRestrictions: knownRestrictions(data?.dietary_restrictions ?? []),
    cannotEat: data?.cannot_eat ?? [],
    dislikes: data?.dislikes ?? [],
    likes: data?.likes ?? [],
  };
});

/** Saves the signed-in user's food preferences, replacing what was there. */
export async function saveFoodPreferences(preferences: FoodPreferences) {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase.from("food_preferences").upsert({
    user_id: user.sub,
    dietary_restrictions: preferences.dietaryRestrictions,
    cannot_eat: preferences.cannotEat,
    dislikes: preferences.dislikes,
    likes: preferences.likes,
  });
  if (error) console.error("saveFoodPreferences failed:", error.message);

  return { ok: !error };
}
