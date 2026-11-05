import { z } from "zod";
import { MAX_HOUSEHOLD_SIZE, MAX_MEALS_PER_WEEK, MIN_HOUSEHOLD_SIZE } from "@/lib/household";
import { normalizeFood, type DietaryRestriction, type FoodPreferences } from "@/lib/preferences";

// Weekly meal plans: the shape a generated plan must have and the checks it
// passes before it's saved. The model suggests meals; this file decides which
// ones are allowed. Quantities stay numbers with a fixed unit so the grocery
// list (lib/groceries.ts) can add them up.

/**
 * The shortest week we'll save when the model comes back short. Users who ask
 * for fewer dinners than this get exactly what they asked for.
 */
export const MIN_DINNERS_PER_WEEK = 3;
export const UNITS = [
  "g",
  "kg",
  "ml",
  "l",
  "tsp",
  "tbsp",
  "cup",
  "oz",
  "lb",
  "each",
  "clove",
  "slice",
  "can",
  "bunch",
  "pinch",
] as const;

export type Unit = (typeof UNITS)[number];

/** Grocery store sections, in the order people usually walk them. */
export const AISLES = [
  "produce",
  "meat-seafood",
  "dairy-eggs",
  "bakery",
  "pantry",
  "spices",
  "frozen",
  "other",
] as const;

export type Aisle = (typeof AISLES)[number];

// No transforms here: this schema is also sent to the model as the output
// format, so it has to convert to plain JSON Schema.
const ingredientSchema = z.object({
  name: z.string().min(1).max(60),
  quantity: z.number().positive(),
  unit: z.enum(UNITS),
  aisle: z.enum(AISLES),
});

/**
 * Ingredients as saved. Plans made before ingredients had an aisle read as
 * "other" rather than failing to load.
 */
export const savedIngredientsSchema = z.array(
  ingredientSchema.extend({ aisle: z.enum(AISLES).catch("other") }),
);

export const mealSchema = z.object({
  title: z.string().min(1).max(80),
  summary: z.string().max(240),
  totalMinutes: z.number().int().min(5).max(240),
  servings: z.number().int().min(MIN_HOUSEHOLD_SIZE).max(MAX_HOUSEHOLD_SIZE),
  ingredients: z.array(ingredientSchema).min(1).max(30),
  steps: z.array(z.string().min(1).max(500)).min(1).max(20),
});

// What the model returns. It can be asked for fewer meals than a full week
// (replacements, swaps), so the week's minimum is checked after filtering.
export const generatedPlanSchema = z.object({
  meals: z.array(mealSchema).min(1).max(MAX_MEALS_PER_WEEK),
});

export type Ingredient = z.infer<typeof ingredientSchema>;
export type Meal = z.infer<typeof mealSchema>;

// Foods that hide behind a broader name. Saying "shellfish" has to rule out
// shrimp too, since a recipe will list "shrimp", not "shellfish".
const FOOD_GROUPS = {
  shellfish: [
    "shrimp",
    "prawn",
    "crab",
    "lobster",
    "crawfish",
    "scallop",
    "clam",
    "mussel",
    "oyster",
  ],
  pork: ["bacon", "ham", "prosciutto", "pancetta", "chorizo"],
  nuts: [
    "almond",
    "cashew",
    "walnut",
    "pecan",
    "pistachio",
    "hazelnut",
    "macadamia",
    "pine nut",
    "peanut",
  ],
};

// Allergy restrictions from the preferences page, as foods to keep out.
const RESTRICTION_FOODS: Partial<Record<DietaryRestriction, string[]>> = {
  "nut-free": ["nut", ...FOOD_GROUPS.nuts],
  "shellfish-free": ["shellfish", ...FOOD_GROUPS.shellfish],
  "egg-free": ["egg", "mayonnaise"],
};

const words = (food: string) =>
  normalizeFood(food)
    .split(/[^a-z]+/)
    .filter(Boolean);

/** "peanut" and "peanuts", "tomato" and "tomatoes" count as the same word. */
function sameWord(a: string, b: string) {
  return a === b || a === `${b}s` || b === `${a}s` || a === `${b}es` || b === `${a}es`;
}

/** Whole-word match, so "egg" catches "eggs" but not "eggplant". */
function mentions(text: string, food: string) {
  const textWords = words(text);
  const foodWords = words(food);
  if (foodWords.length === 0) return false;
  return textWords.some((_, start) =>
    foodWords.every(
      (word, i) => start + i < textWords.length && sameWord(textWords[start + i], word),
    ),
  );
}

type SafetyPreferences = Pick<FoodPreferences, "cannotEat" | "dietaryRestrictions">;

/** Every food a plan must avoid: the can't-eat list, its groups, and allergy restrictions. */
export function blockedFoods(preferences: SafetyPreferences) {
  const blocked = new Set<string>();
  for (const food of preferences.cannotEat) {
    blocked.add(food);
    for (const [group, members] of Object.entries(FOOD_GROUPS)) {
      if (mentions(food, group)) members.forEach((member) => blocked.add(member));
    }
  }
  for (const restriction of preferences.dietaryRestrictions) {
    RESTRICTION_FOODS[restriction]?.forEach((food) => blocked.add(food));
  }
  return [...blocked];
}

/**
 * Splits generated meals into ones that are safe to serve and ones that use a
 * blocked food in their title or ingredients. Never trust the model to have
 * followed the can't-eat list; callers replace or drop what comes back in
 * `removed`.
 */
export function removeUnsafeMeals(meals: Meal[], preferences: SafetyPreferences) {
  const blocked = blockedFoods(preferences);
  const uses = (meal: Meal, food: string) =>
    mentions(meal.title, food) ||
    meal.ingredients.some((ingredient) => mentions(ingredient.name, food));

  const safe: Meal[] = [];
  const removed: { meal: Meal; food: string }[] = [];
  for (const meal of meals) {
    const food = blocked.find((blockedFood) => uses(meal, blockedFood));
    if (food) removed.push({ meal, food });
    else safe.push(meal);
  }
  return { safe, removed };
}

/** Whose calendar decides what day it is, until profiles store a time zone. */
export const PLAN_TIME_ZONE = "America/New_York";

/** The calendar date (YYYY-MM-DD) at `now` in `timeZone`, not on the server's clock. */
export function localDate(now: Date, timeZone = PLAN_TIME_ZONE) {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(now);
}

/** The Monday of the week `today` (YYYY-MM-DD) falls in. */
export function currentWeekStart(today: string) {
  const date = new Date(`${today}T00:00:00Z`);
  // getUTCDay: Sunday is 0. Sunday is 6 days after Monday, Tuesday is 1.
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  return date.toISOString().slice(0, 10);
}

/**
 * The Monday a plan made on `today` (YYYY-MM-DD, the user's local date) is for:
 * today if it's Monday, otherwise the next Monday.
 */
export function upcomingWeekStart(today: string) {
  const date = new Date(`${today}T00:00:00Z`);
  // getUTCDay: Sunday is 0. Sunday is 1 day from Monday, Tuesday is 6.
  date.setUTCDate(date.getUTCDate() + ((8 - date.getUTCDay()) % 7));
  return date.toISOString().slice(0, 10);
}

/** "November 9" for a week starting 2026-11-09. */
export function formatWeekOf(weekStart: string) {
  return new Date(`${weekStart}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
