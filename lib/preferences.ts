import { z } from "zod";

// Food preferences: the options shown on the preferences page and the rules
// for what gets saved. Shared by the form and the server action so both sides
// agree on what's valid.

// Grouped so the form can show them in sections. Keep the total under the
// database's limit of 30 per user (see the food_preferences migration).
export const DIETARY_RESTRICTIONS = [
  // Ways of eating
  { value: "vegetarian", label: "Vegetarian", hint: "No meat or fish", group: "style" },
  { value: "vegan", label: "Vegan", hint: "Nothing from animals", group: "style" },
  { value: "pescatarian", label: "Pescatarian", hint: "Fish, but no meat", group: "style" },
  { value: "flexitarian", label: "Flexitarian", hint: "Mostly plants, some meat", group: "style" },
  {
    value: "mediterranean",
    label: "Mediterranean",
    hint: "Olive oil, fish, grains",
    group: "style",
  },
  { value: "paleo", label: "Paleo", hint: "No grains, dairy, or beans", group: "style" },
  // Nutrition goals
  {
    value: "high-protein",
    label: "High protein",
    hint: "Protein in every meal",
    group: "nutrition",
  },
  { value: "low-carb", label: "Low carb", hint: "Easy on bread and pasta", group: "nutrition" },
  { value: "keto", label: "Keto", hint: "Very low carb, high fat", group: "nutrition" },
  { value: "low-sugar", label: "Low sugar", hint: "Little added sugar", group: "nutrition" },
  {
    value: "heart-healthy",
    label: "Heart healthy",
    hint: "Low sodium, lighter fats",
    group: "nutrition",
  },
  {
    value: "high-fiber",
    label: "High fiber",
    hint: "Plenty of beans and greens",
    group: "nutrition",
  },
  // Faith and culture
  { value: "halal", label: "Halal", hint: "No pork or alcohol", group: "faith" },
  { value: "kosher", label: "Kosher", hint: "Meat and dairy kept apart", group: "faith" },
  { value: "no-beef", label: "No beef", hint: "Common in Hindu homes", group: "faith" },
  { value: "jain", label: "Jain", hint: "No meat or root vegetables", group: "faith" },
  { value: "buddhist", label: "Buddhist", hint: "No meat, onion, or garlic", group: "faith" },
  { value: "lenten", label: "Lenten", hint: "Meatless fast days", group: "faith" },
  // Allergies and intolerances
  {
    value: "gluten-free",
    label: "Gluten-free",
    hint: "No wheat, barley, or rye",
    group: "allergy",
  },
  {
    value: "dairy-free",
    label: "Dairy-free",
    hint: "No milk, cheese, or butter",
    group: "allergy",
  },
  { value: "egg-free", label: "Egg-free", hint: "No eggs", group: "allergy" },
  { value: "soy-free", label: "Soy-free", hint: "No soy sauce or tofu", group: "allergy" },
  { value: "nut-free", label: "Nut allergy", hint: "No peanuts or tree nuts", group: "allergy" },
  {
    value: "shellfish-free",
    label: "Shellfish allergy",
    hint: "No shrimp, crab, or lobster",
    group: "allergy",
  },
] as const;

export type DietaryRestriction = (typeof DIETARY_RESTRICTIONS)[number]["value"];
export type DietGroup = (typeof DIETARY_RESTRICTIONS)[number]["group"];

const DIETARY_VALUES = DIETARY_RESTRICTIONS.map((option) => option.value);

// Quick adds for each list, most common first (phones show the first 12). No
// food appears in two lists, and "can't eat" skips the allergies the diet step
// already asks about (gluten, dairy, eggs, soy, nuts, shellfish).
export const CANNOT_EAT_SUGGESTIONS = [
  "sesame",
  "fish",
  "pork",
  "red meat",
  "corn",
  "mustard",
  "celery",
  "coconut",
  "tomatoes",
  "strawberries",
  "garlic",
  "alcohol",
  "onions",
  "peppers",
  "avocado",
  "lamb",
];
export const DISLIKE_SUGGESTIONS = [
  "mushrooms",
  "cilantro",
  "olives",
  "spicy food",
  "eggplant",
  "blue cheese",
  "anchovies",
  "beets",
  "brussels sprouts",
  "raisins",
  "mayonnaise",
  "okra",
  "tofu",
  "liver",
  "pickles",
  "goat cheese",
];
export const LIKE_SUGGESTIONS = [
  "pasta",
  "chicken thighs",
  "tacos",
  "salmon",
  "curry",
  "stir-fry",
  "pizza",
  "soup",
  "rice bowls",
  "burgers",
  "roast chicken",
  "roasted veggies",
  "steak",
  "fried rice",
  "lasagna",
  "chili",
];

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
