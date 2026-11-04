import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { currentWeekStart, type Ingredient, type Meal } from "@/lib/meal-plan";
import { groceryIngredientsSchema, type GroceryMeal, type GroceryMealInput } from "@/lib/groceries";
import type { KrogerStore } from "@/lib/kroger/stores";
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
    .select(
      "display_name, onboarded_at, household_size, kroger_location_id, kroger_store_name, kroger_store_address",
    )
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
    /** How many people they cook for: the default serving count for recipes. */
    householdSize: data.household_size,
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

/** Saves how many people the signed-in user cooks for. */
export async function saveHouseholdSize(householdSize: number) {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ household_size: householdSize })
    .eq("id", user.sub);
  if (error) console.error("saveHouseholdSize failed:", error.message);

  return { ok: !error };
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
      "id, week_start, planned_meals (id, title, summary, total_minutes, servings, ingredients, steps)",
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
    meals: data.planned_meals.map((meal) => ({
      id: meal.id,
      title: meal.title,
      summary: meal.summary,
      totalMinutes: meal.total_minutes,
      servings: meal.servings,
      // JSON columns: checked against mealSchema before they're saved.
      ingredients: meal.ingredients as Ingredient[],
      steps: meal.steps as string[],
    })),
  };
});

export type MealPlan = NonNullable<Awaited<ReturnType<typeof getMealPlan>>>;

/**
 * Saves the signed-in user's plan for a week, replacing any plan they already
 * have for it. All or nothing: if it fails, their earlier plan is still there.
 */
export async function saveMealPlan(weekStart: string, meals: Meal[]) {
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

/** Saved recipe requirements for the signed-in user's current grocery list. */
export const getGroceryMeals = cache(async (): Promise<GroceryMeal[]> => {
  const user = await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("grocery_meals")
    .select("id, title, recipe_servings, planned_servings, included, ingredients")
    .eq("user_id", user.sub)
    .order("created_at")
    .order("id");
  if (error) throw new Error("We couldn't load your saved meals. Please try again.");
  return data.map((meal) => ({
    id: meal.id,
    title: meal.title,
    recipeServings: meal.recipe_servings,
    plannedServings: meal.planned_servings,
    included: meal.included,
    ingredients: groceryIngredientsSchema.parse(meal.ingredients),
  }));
});

export async function saveGroceryMealEntry(meal: GroceryMealInput, id?: string) {
  const user = await requireUser();
  const supabase = await createClient();
  const values = {
    title: meal.title,
    recipe_servings: meal.recipeServings,
    planned_servings: meal.plannedServings,
    included: meal.included,
    ingredients: meal.ingredients,
  };
  const query = id
    ? supabase.from("grocery_meals").update(values).eq("id", id).eq("user_id", user.sub)
    : supabase.from("grocery_meals").insert({ ...values, user_id: user.sub });
  const { error } = await query.select("id").single();
  if (error) console.error("saveGroceryMealEntry failed:", error.message);
  return { ok: !error };
}

export async function setGroceryMealIncluded(id: string, included: boolean) {
  const user = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("grocery_meals")
    .update({ included })
    .eq("id", id)
    .eq("user_id", user.sub)
    .select("id")
    .single();
  if (error) console.error("setGroceryMealIncluded failed:", error.message);
  return { ok: !error };
}

export async function deleteGroceryMealEntry(id: string) {
  const user = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("grocery_meals")
    .delete()
    .eq("id", id)
    .eq("user_id", user.sub)
    .select("id")
    .single();
  if (error) console.error("deleteGroceryMealEntry failed:", error.message);
  return { ok: !error };
}
