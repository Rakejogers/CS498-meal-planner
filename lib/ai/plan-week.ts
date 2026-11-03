import "server-only";
import { generateText, Output } from "ai";
import {
  generatedPlanSchema,
  MIN_DINNERS_PER_WEEK,
  removeUnsafeMeals,
  UNITS,
  type Meal,
} from "@/lib/meal-plan";
import { DIETARY_RESTRICTIONS, type FoodPreferences } from "@/lib/preferences";
import { fakeMeals } from "./fake-meals";

// Plans dinners through the Vercel AI Gateway. The model picks the meals;
// lib/meal-plan.ts checks them, and nothing here touches the database.

export type PlanRequest = {
  dinners: number;
  /** Servings for every meal. */
  householdSize: number;
  preferences: FoodPreferences;
  /** Meal titles to leave out: ones already planned or being swapped away. */
  avoid?: string[];
};

/** Asks the model for meals. Null when it couldn't produce any. */
export type GenerateMeals = (request: PlanRequest) => Promise<Meal[] | null>;

export type PlanResult = { ok: true; meals: Meal[] } | { ok: false };

const MODEL = "anthropic/claude-haiku-5.5";

// Everything about the user goes in the message.
const SYSTEM_PROMPT = `You plan weeknight dinners for a home cook.

Rules:
- Plan exactly the number of dinners asked for, each a complete recipe.
- Never use a food the cook can't eat, including hidden in sauces, stocks, spice blends, or garnishes. Follow every dietary need.
- Avoid foods they dislike.
- Foods they enjoy are a hint about their taste, not a shopping list. Build at most one of the dinners around one of them. Every other dinner should use main ingredients and dishes they haven't mentioned but would probably like.
- Vary cuisines, proteins, and cooking methods across the week.
- Where it's natural, share fresh ingredients between dinners (half a bunch of cilantro, the rest of a can of coconut milk) so less goes to waste.
- Every recipe serves the number of people given, with quantities for that many servings.
- Ingredient names are plain grocery items in lowercase, like "yellow onion" or "chicken thighs". Prep goes in the steps, not the name.
- Quantities are numbers. Units are one of: ${UNITS.join(", ")}. Use "each" for whole items like eggs or lemons.
- totalMinutes includes prep. Keep most dinners under 45 minutes.
- The summary is one appetizing sentence about the dish.`;

const list = (items: string[]) => (items.length ? items.join(", ") : "none");

function describeRequest({ dinners, householdSize, preferences, avoid = [] }: PlanRequest) {
  const restrictions = DIETARY_RESTRICTIONS.filter((option) =>
    preferences.dietaryRestrictions.includes(option.value),
  ).map((option) => option.label);

  return [
    `Plan ${dinners} ${dinners === 1 ? "dinner" : "dinners"} for ${householdSize} ${householdSize === 1 ? "person" : "people"}.`,
    `Dietary needs: ${list(restrictions)}`,
    `Can't eat: ${list(preferences.cannotEat)}`,
    `Dislikes: ${list(preferences.dislikes)}`,
    `Foods they enjoy (inspiration only): ${list(preferences.likes)}`,
    avoid.length ? `Don't plan any of these again: ${avoid.join("; ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export const generateMeals: GenerateMeals = async (request) => {
  try {
    const { output } = await generateText({
      model: MODEL,
      maxOutputTokens: 16000,
      output: Output.object({ schema: generatedPlanSchema }),
      system: SYSTEM_PROMPT,
      prompt: describeRequest(request),
    });
    return output.meals;
  } catch (error) {
    // API errors (after the SDK's own retries) and output that fails the schema.
    console.error("generateMeals failed:", error instanceof Error ? error.message : error);
    return null;
  }
};

/**
 * Plans a week: asks for dinners, drops any that use a food the user can't
 * eat, and asks once more to fill the gaps. A week can come back a dinner or
 * two short, but never below MIN_DINNERS_PER_WEEK.
 */
export async function planWeek(
  request: PlanRequest,
  generate: GenerateMeals = process.env.PLAN_GENERATOR === "fake" ? fakeMeals : generateMeals,
): Promise<PlanResult> {
  const avoid = [...(request.avoid ?? [])];
  const meals: Meal[] = [];

  const add = (generated: Meal[] | null) => {
    const { safe, removed } = removeUnsafeMeals(generated ?? [], request.preferences);
    for (const { meal, food } of removed) {
      console.warn(`planWeek: dropped "${meal.title}" for using ${food}`);
    }
    meals.push(...safe);
    avoid.push(...safe.map((meal) => meal.title), ...removed.map(({ meal }) => meal.title));
  };

  add(await generate(request));
  if (meals.length < request.dinners) {
    add(await generate({ ...request, dinners: request.dinners - meals.length, avoid: [...avoid] }));
  }

  if (meals.length < Math.min(request.dinners, MIN_DINNERS_PER_WEEK)) return { ok: false };
  return { ok: true, meals: meals.slice(0, request.dinners) };
}
