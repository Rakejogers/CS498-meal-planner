import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { z } from "zod";
import { currentWeekStart, savedIngredientsSchema } from "@/lib/meal-plan";
import type { DraftMeal } from "@/lib/meal-prep";
import {
  pantryStateSchema,
  remainingPantry,
  type PantryDetails,
  type PantryItem,
  type PantryState,
} from "@/lib/pantry";
import { UNITS } from "@/lib/meal-plan";
import type { Household } from "@/lib/household";
import type { KrogerStore } from "@/lib/kroger/stores";
import { googleAvatarUrl } from "@/lib/auth";
import { knownRestrictions, normalizeFood, type FoodPreferences } from "@/lib/preferences";
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
    .select(
      "display_name, onboarded_at, household_size, meals_per_week, cooking_days, kroger_location_id, kroger_store_name, kroger_store_address",
    )
    .eq("id", user.sub)
    .maybeSingle();

  if (error) throw new Error(error.message);

  // A valid session for a user that no longer exists (e.g. after `db:reset`).
  if (!data) redirect("/auth/signout");

  return {
    email: user.email ?? "",
    displayName: data.display_name,
    /** Their Google profile photo, if they signed in with Google. */
    avatarUrl: googleAvatarUrl(user.user_metadata),
    /** False until the user finishes (or skips) first-time setup. */
    onboarded: data.onboarded_at !== null,
    /** How many people they cook for: the default serving count for recipes. */
    householdSize: data.household_size,
    /** How many dinners to plan each week. */
    mealsPerWeek: data.meals_per_week,
    /** How many of those dinners they want to cook. The rest are leftovers. */
    cookingDays: data.cooking_days,
    /** The Kroger store they shop at, or null until they choose one. */
    krogerStore:
      data.kroger_location_id && data.kroger_store_name && data.kroger_store_address
        ? ({
            locationId: data.kroger_location_id,
            name: data.kroger_store_name,
            address: data.kroger_store_address,
          } satisfies KrogerStore)
        : null,
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

/** Saves how many people they cook for, how many dinners they want, and how many days they cook. */
export async function saveHousehold({ householdSize, mealsPerWeek, cookingDays }: Household) {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      household_size: householdSize,
      meals_per_week: mealsPerWeek,
      cooking_days: cookingDays,
    })
    .eq("id", user.sub);
  if (error) console.error("saveHousehold failed:", error.message);

  return { ok: !error };
}

/** The signed-in user's pantry items, for pantry-aware planning and recipes. */
export const getPantryItems = cache(async (): Promise<PantryItem[]> => {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pantry_items")
    .select("id, name, state, quantity, unit, bought_on, expires_on, opened_on")
    .eq("user_id", user.sub)
    .order("name");

  if (error) throw new Error(error.message);

  return (data ?? []).map(toPantryItem);
});

function toPantryItem(item: {
  id: string;
  name: string;
  state: string;
  quantity: number | string;
  unit: string;
  bought_on: string | null;
  expires_on: string | null;
  opened_on: string | null;
}): PantryItem {
  return {
    id: item.id,
    name: normalizeFood(item.name),
    state: pantryStateSchema.parse(item.state),
    quantity: z.number().positive().parse(Number(item.quantity)),
    unit: z.enum(UNITS).parse(item.unit),
    boughtOn: item.bought_on,
    expiresOn: item.expires_on,
    openedOn: item.opened_on,
  };
}

function pantryWriteError(error: { code?: string; message: string } | null) {
  if (!error) return null;
  console.error("pantry write failed:", error.message);
  return error.code === "23505" ? "duplicate" : "failed";
}

/** Adds one pantry item for the signed-in user. */
export async function addPantryItem(item: PantryDetails) {
  const user = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("pantry_items")
    .insert({ user_id: user.sub, ...pantryFields(item) });
  return { ok: !error, reason: pantryWriteError(error) };
}

/** Replaces the signed-in user's pantry item, including a blank date. */
export async function updatePantryItem(id: string, item: PantryDetails) {
  const user = await requireUser();
  if (!z.guid().safeParse(id).success) return { ok: false, reason: "failed" as const };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pantry_items")
    .update(pantryFields(item))
    .eq("id", id)
    .eq("user_id", user.sub)
    .select("id");
  if (error || !data?.length) return { ok: false, reason: pantryWriteError(error) ?? "failed" };
  return { ok: true, reason: null };
}

/** Changes only the have / low / out / unsure state. */
export async function setPantryItemState(id: string, state: PantryState) {
  const user = await requireUser();
  if (!z.guid().safeParse(id).success) return { ok: false };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pantry_items")
    .update({ state })
    .eq("id", id)
    .eq("user_id", user.sub)
    .select("id");
  if (error) console.error("setPantryItemState failed:", error.message);
  return { ok: !error && Boolean(data?.length) };
}

/** Removes one pantry item owned by the signed-in user. */
export async function deletePantryItem(id: string) {
  const user = await requireUser();
  if (!z.guid().safeParse(id).success) return { ok: false };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pantry_items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.sub)
    .select("id");
  if (error) console.error("deletePantryItem failed:", error.message);
  return { ok: !error && Boolean(data?.length) };
}

/**
 * Marks one of the signed-in user's dinners as cooked and subtracts its
 * ingredient amounts from the pantry. A second click does not subtract again.
 */
export async function cookPlannedMeal(id: string) {
  const user = await requireUser();
  if (!z.guid().safeParse(id).success) return { ok: false };
  const meal = await getPlannedMeal(id);
  if (!meal || meal.cookedAt) return { ok: Boolean(meal) };
  // Leftover nights are the same batch. Marking the cook is what uses the pantry.
  if (!meal.countsForGroceries) return { ok: false };

  const supabase = await createClient();
  const { data: claimed, error: claimError } = await supabase
    .from("planned_meals")
    .update({ cooked_at: new Date().toISOString() })
    .eq("id", meal.id)
    .is("cooked_at", null)
    .select("id");
  if (claimError || !claimed?.length) {
    if (claimError) console.error("cookPlannedMeal failed:", claimError.message);
    return { ok: !claimError };
  }

  const pantry = await getPantryItems();
  const remaining = remainingPantry(pantry, [meal]);
  for (const item of pantry) {
    const next = remaining.find((entry) => entry.name === item.name);
    if (!next || next.quantity === item.quantity) continue;
    const { error } = await supabase
      .from("pantry_items")
      .update({ quantity: next.quantity, state: next.quantity === 0 ? "out" : item.state })
      .eq("id", item.id)
      .eq("user_id", user.sub);
    if (error) console.error("cookPlannedMeal pantry update failed:", error.message);
  }
  return { ok: true };
}

function pantryFields(item: PantryDetails) {
  return {
    name: item.name,
    state: item.state,
    quantity: item.quantity,
    unit: item.unit,
    bought_on: item.boughtOn,
    expires_on: item.expiresOn,
    opened_on: item.openedOn,
  };
}

/**
 * The plan the signed-in user is cooking from on `today` (YYYY-MM-DD), with its
 * meals in order: this week's if they have one, otherwise the next one coming
 * up. Null when they have nothing planned, so finished weeks drop off.
 */
export const getMealPlan = cache(async (today: string) => {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("meal_plans")
    .select(
      "id, week_start, planned_meals (id, title, summary, total_minutes, servings, ingredients, steps, cooked_at, nights, counts_for_groceries)",
    )
    .eq("user_id", user.sub)
    .gte("week_start", currentWeekStart(today))
    .order("week_start")
    .order("position", { referencedTable: "planned_meals" })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    id: data.id,
    weekStart: data.week_start,
    meals: data.planned_meals.map(toPlannedMeal),
  };
});

export type MealPlan = NonNullable<Awaited<ReturnType<typeof getMealPlan>>>;

/**
 * One dinner from the signed-in user's plans, with its full recipe, its place
 * in the week, and the week it's for. Null when there's no such dinner or it
 * belongs to someone else.
 */
export const getPlannedMeal = cache(async (id: string) => {
  const user = await requireUser();
  // Postgres rejects ids that aren't UUIDs with an error, not an empty result.
  if (!z.guid().safeParse(id).success) return null;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("planned_meals")
    .select(
      "id, position, title, summary, total_minutes, servings, ingredients, steps, cooked_at, nights, counts_for_groceries, meal_plans!inner (week_start, user_id)",
    )
    .eq("id", id)
    .eq("meal_plans.user_id", user.sub)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    ...toPlannedMeal(data),
    /** Its place in the week (0 is the first), matching the dinner cards. */
    position: data.position,
    weekStart: data.meal_plans.week_start,
  };
});

type PlannedMealRow = {
  id: string;
  title: string;
  summary: string;
  total_minutes: number;
  servings: number;
  ingredients: unknown;
  steps: unknown;
  cooked_at: string | null;
  nights: number;
  counts_for_groceries: boolean;
};

function toPlannedMeal(meal: PlannedMealRow) {
  return {
    id: meal.id,
    title: meal.title,
    summary: meal.summary,
    totalMinutes: meal.total_minutes,
    servings: meal.servings,
    // JSON columns: checked against mealSchema before they're saved.
    ingredients: savedIngredientsSchema.parse(meal.ingredients),
    steps: meal.steps as string[],
    cookedAt: meal.cooked_at,
    nights: meal.nights,
    countsForGroceries: meal.counts_for_groceries,
  };
}

/**
 * Saves the signed-in user's plan for a week, replacing any plan they already
 * have for it. All or nothing: if it fails, their earlier plan is still there.
 */
export async function saveMealPlan(weekStart: string, meals: DraftMeal[]) {
  await requireUser();
  const supabase = await createClient();

  const { error } = await supabase.rpc("save_meal_plan", {
    p_week_start: weekStart,
    p_meals: meals.map((meal) => ({
      title: meal.title,
      summary: meal.summary,
      total_minutes: meal.totalMinutes,
      servings: meal.servings,
      ingredients: meal.ingredients,
      steps: meal.steps,
      nights: meal.nights,
      counts_for_groceries: meal.countsForGroceries,
    })),
  });
  if (error) console.error("saveMealPlan failed:", error.message);
  return { ok: !error };
}

/**
 * Saves the Kroger store the signed-in user shops at. Pass a store from
 * `getStore` (lib/kroger/stores.ts), not one built from form input.
 */
export async function saveKrogerStore(store: KrogerStore) {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      kroger_location_id: store.locationId,
      kroger_store_name: store.name,
      kroger_store_address: store.address,
    })
    .eq("id", user.sub);
  if (error) console.error("saveKrogerStore failed:", error.message);
  return { ok: !error };
}
