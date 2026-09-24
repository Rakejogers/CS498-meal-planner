import { z } from "zod";
import type { Enums } from "@/lib/supabase/database.types";

type Option<T> = { value: T; label: string; description?: string; symbol?: string };

// Options shown during onboarding. Shared by the client form and the server
// action so both sides agree on what's valid.

export const CUISINES = [
  "Italian",
  "Mexican",
  "Mediterranean",
  "Chinese",
  "Japanese",
  "Thai",
  "Indian",
  "Korean",
  "Middle Eastern",
  "Vietnamese",
  "French",
  "American comfort",
] as const;

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

export const COOK_TIMES = [
  { value: 15, label: "15 min", description: "In and out" },
  { value: 30, label: "30 min", description: "Most weeknights" },
  { value: 45, label: "45 min", description: "A little project" },
  { value: 60, label: "An hour+", description: "I enjoy it" },
] as const;

export const COOKING_CONFIDENCE = [
  {
    value: "beginner",
    label: "Keep it simple",
    description: "Short ingredient lists and forgiving techniques.",
  },
  {
    value: "comfortable",
    label: "Happy to follow a recipe",
    description: "Most recipes are fair game.",
  },
  {
    value: "confident",
    label: "Bring on a challenge",
    description: "New techniques and cuisines welcome.",
  },
] as const satisfies readonly Option<Enums<"cooking_confidence">>[];

export const LEFTOVERS = [
  { value: "love", label: "Love them", description: "Cook extra for lunch" },
  { value: "sometimes", label: "Now and then", description: "A night or two" },
  { value: "avoid", label: "Fresh each night", description: "Skip leftovers" },
] as const satisfies readonly Option<Enums<"leftover_preference">>[];

export const BUDGETS = [
  { value: "thrifty", label: "Keep it lean", symbol: "$" },
  { value: "balanced", label: "Balanced", symbol: "$$" },
  { value: "flexible", label: "Treat ourselves", symbol: "$$$" },
] as const satisfies readonly Option<Enums<"budget_preference">>[];

export const STAPLE_GROUPS = [
  {
    label: "Basics",
    items: ["olive oil", "vegetable oil", "butter", "salt", "black pepper", "flour", "sugar"],
  },
  { label: "Aromatics", items: ["garlic", "onions", "ginger", "lemons"] },
  {
    label: "Pantry",
    items: ["rice", "pasta", "canned tomatoes", "chicken broth", "black beans", "oats"],
  },
  {
    label: "Sauces & spices",
    items: ["soy sauce", "honey", "dijon mustard", "red pepper flakes", "cumin", "paprika", "dried oregano"],
  },
  { label: "Fridge", items: ["eggs", "milk", "parmesan", "greek yogurt"] },
] as const;

export type Staple = (typeof STAPLE_GROUPS)[number]["items"][number];

export const DEFAULT_STAPLES: Staple[] = [
  "olive oil",
  "butter",
  "salt",
  "black pepper",
  "flour",
  "sugar",
  "garlic",
  "onions",
  "rice",
  "pasta",
  "eggs",
];

export const DISLIKE_SUGGESTIONS = ["mushrooms", "cilantro", "olives", "spicy food", "seafood", "eggplant"];
export const USE_SOON_SUGGESTIONS = ["spinach", "bell peppers", "chicken thighs", "zucchini", "tortillas"];

export const STAPLES: Staple[] = STAPLE_GROUPS.flatMap((group) => group.items);

const values = <T extends readonly { value: string }[]>(options: T) =>
  options.map((option) => option.value) as [T[number]["value"], ...T[number]["value"][]];

export const DIETARY_VALUES = values(DIETARY_RESTRICTIONS);

/** Keeps only values from a known option list (drops anything stale in the DB). */
export function onlyKnown<T extends string>(list: string[], known: readonly T[]): T[] {
  return list.filter((value): value is T => (known as readonly string[]).includes(value));
}

const ingredientName = z
  .string()
  .trim()
  .toLowerCase()
  .min(1)
  .max(80)
  .overwrite((name) => name.replace(/\s+/g, " "));

export const onboardingSchema = z.object({
  displayName: z.string().trim().min(1, "Tell us what to call you.").max(60),
  householdSize: z.number().int().min(1).max(12),
  dinnersPerWeek: z.number().int().min(1).max(7),
  cuisines: z.array(z.enum(CUISINES)).max(CUISINES.length),
  dietaryRestrictions: z.array(z.enum(DIETARY_VALUES)),
  dislikes: z.array(ingredientName).max(30),
  maxCookMinutes: z.number().int().min(10).max(180),
  cookingConfidence: z.enum(values(COOKING_CONFIDENCE)),
  leftovers: z.enum(values(LEFTOVERS)),
  budget: z.enum(values(BUDGETS)),
  staples: z.array(z.enum(STAPLES)),
  useSoon: z.array(ingredientName).max(30),
});

export type OnboardingInput = z.input<typeof onboardingSchema>;
