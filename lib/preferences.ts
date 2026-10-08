import { z } from "zod";

// Food preferences: the options shown on the preferences page and the rules
// for what gets saved. Shared by the form and the server action so both sides
// agree on what's valid.

export const DIETARY_RESTRICTIONS = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "pescatarian", label: "Pescatarian" },
  { value: "gluten-free", label: "Gluten-free" },
  { value: "dairy-free", label: "Dairy-free" },
  { value: "nut-free", label: "Nut allergy" },
  { value: "shellfish-free", label: "Shellfish allergy" },
  { value: "egg-free", label: "Egg-free" },
] as const;

export type DietaryRestriction = (typeof DIETARY_RESTRICTIONS)[number]["value"];

const DIETARY_VALUES = DIETARY_RESTRICTIONS.map((option) => option.value);

export const CANNOT_EAT_SUGGESTIONS = ["peanuts", "shellfish", "pork", "sesame", "soy"];
export const DISLIKE_SUGGESTIONS = ["mushrooms", "cilantro", "olives", "spicy food", "eggplant"];
export const LIKE_SUGGESTIONS = ["pasta", "chicken thighs", "tacos", "salmon", "curry"];

export const MAX_FOODS_PER_LIST = 30;
export const MAX_FOOD_LENGTH = 60;

export type FoodPreferences = {
  dietaryRestrictions: DietaryRestriction[];
  cannotEat: string[];
  dislikes: string[];
  likes: string[];
};

/** " Spicy   Food " → "spicy food", so the same food is always stored one way. */
export function normalizeFood(raw: string) {
  return raw.trim().toLowerCase().replace(/\s+/g, " ").slice(0, MAX_FOOD_LENGTH).trim();
}

/**
 * Tidies what the form sent: normalizes names, drops blanks and repeats, and
 * keeps each food in one list only. When a food is in more than one, the
 * stricter list wins (can't eat, then dislike, then like), so the planner
 * never sees "likes shrimp" next to "can't eat shrimp".
 */
export function cleanFoodLists(lists: Pick<FoodPreferences, "cannotEat" | "dislikes" | "likes">) {
  const seen = new Set<string>();
  const clean = (foods: string[]) =>
    foods.map(normalizeFood).filter((food) => {
      if (!food || seen.has(food)) return false;
      seen.add(food);
      return true;
    });

  // Order matters: the stricter lists claim a food first.
  const cannotEat = clean(lists.cannotEat);
  const dislikes = clean(lists.dislikes);
  const likes = clean(lists.likes);
  return { cannotEat, dislikes, likes };
}

/** Keeps only restrictions we still offer (drops anything stale in the DB). */
export function knownRestrictions(values: string[]) {
  return DIETARY_VALUES.filter((value) => values.includes(value));
}

const foodList = z.array(z.string().max(200)).max(200);

export const foodPreferencesSchema = z
  .object({
    dietaryRestrictions: z.array(z.string()).max(DIETARY_VALUES.length * 2),
    cannotEat: foodList,
    dislikes: foodList,
    likes: foodList,
  })
  .transform((input): FoodPreferences => ({
    dietaryRestrictions: knownRestrictions(input.dietaryRestrictions),
    ...cleanFoodLists(input),
  }))
  .refine(
    (preferences) =>
      [preferences.cannotEat, preferences.dislikes, preferences.likes].every(
        (foods) => foods.length <= MAX_FOODS_PER_LIST,
      ),
    `Keep each list to ${MAX_FOODS_PER_LIST} foods or fewer.`,
  );

const strings = (formData: FormData, key: string) => formData.getAll(key).map(String);

/** Reads what `FoodPreferencesFields` submitted. */
export function parseFoodPreferencesForm(formData: FormData) {
  return foodPreferencesSchema.safeParse({
    dietaryRestrictions: strings(formData, "dietaryRestrictions"),
    cannotEat: strings(formData, "cannotEat"),
    dislikes: strings(formData, "dislikes"),
    likes: strings(formData, "likes"),
  });
}
