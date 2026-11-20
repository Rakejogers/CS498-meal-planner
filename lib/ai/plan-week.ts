import "server-only";
import { generateText, Output } from "ai";
import {
  generatedPlanSchema,
  MIN_DINNERS_PER_WEEK,
  removeUnsafeMeals,
  UNITS,
  type Meal,
} from "@/lib/meal-plan";
import { formatGroceryAmount } from "@/lib/groceries";
import { pantryForPlanning, remainingPantry, type PantryStock } from "@/lib/pantry";
import { DIETARY_RESTRICTIONS, type FoodPreferences } from "@/lib/preferences";
import { scaleMealQuantities } from "@/lib/meal-prep";
import { fakeMeals } from "./fake-meals";

// Plans dinners through the Vercel AI Gateway. The model picks the meals;
// lib/meal-plan.ts checks them, and nothing here touches the database.

export type PlanRequest = {
  dinners: number;
  /** Servings for every meal. */
  householdSize: number;
  /**
   * Nights each cooking session covers, in order. When a session covers more
   * than one night, the extra nights are leftovers and the pantry is reduced
   * by the whole batch.
   */
  nights?: number[];
  preferences: FoodPreferences;
  /** What's still on hand. Listed soonest to expire first, and reduced as dinners are kept. */
  pantry?: PantryStock[];
  /** Meal ideas from MealDB that already overlap with pantry ingredients. */
  mealDbCandidates?: string[];
  /** Meal titles to leave out: ones already planned or being swapped away. */
  avoid?: string[];
  /** Ingredients already on this week's list, to reuse where they fit. */
  shopping?: string[];
};

/** Asks the model for meals. Null when it couldn't produce any. */
export type GenerateMeals = (request: PlanRequest) => Promise<Meal[] | null>;

export type PlanResult = { ok: true; meals: Meal[] } | { ok: false };

const MODEL = "anthropic/claude-haiku-5.5";

// Everything about the user goes in the message.
const SYSTEM_PROMPT = `You plan a week of dinners for an ordinary home cook: someone making dinner after work, with everyday skills, a regular kitchen, and one trip to a normal supermarket.

What to cook:
- Plan exactly the number of dinners asked for, each a complete recipe.
- When the request is for cooking sessions, plan that many recipes, not one per night. Extra nights are leftovers of that cook. Write quantities for one dinner, and choose food that keeps and reheats.
- Pick familiar, crowd-pleasing dinners that people actually make at home: tacos, stir-fries, pasta, sheet-pan chicken, chili, soups, curries, grain bowls, burgers, frittatas, fried rice. Comfort food beats anything fancy.
- When MealDB meal ideas are provided, treat them as strong suggestions because they already reuse pantry ingredients. Prefer them unless they clash with the user's needs or would make the week repetitive.
- Title dishes the way someone would say them at home ("Chicken and broccoli stir-fry", "Turkey chili"), not like a restaurant menu. No foams, reductions, gastriques, or ingredient lists in the title.
- Every ingredient is something a regular US supermarket stocks. Skip specialty items like saffron, truffle, fresh lemongrass, gochujang, sumac, or exotic cuts of meat.
- Keep recipes simple: about 10 ingredients or fewer (not counting salt, pepper, and cooking oil), 4 to 7 short steps, and one or two pots or pans. No deep-frying, no from-scratch stock or pasta, no special equipment.
- totalMinutes includes prep. Most dinners take 30 to 40 minutes; none take more than an hour.
- Vary the week: different proteins and styles of dish, so no two dinners feel the same.

Shop once, waste little. Plan the week as one shopping list:
- Build the week around a few shared fresh ingredients. Most produce, herbs, dairy, and opened packages should show up in at least two dinners, so nothing is bought for a single tablespoon and then thrown out.
- Use up whole packages across the week: a bunch of cilantro, a bag of spinach, a block of cheddar, a tub of sour cream, a pack of tortillas, a can of coconut milk.
- A protein can carry two dinners if they taste different, like chicken thighs in tacos early in the week and in fried rice later.
- Give a shared ingredient the exact same name and unit in every dinner ("yellow onion", "each"), so the grocery list can add them up.
- When pantry ingredients are available, prefer dinners that use them when it still makes sense for the week.
- Pantry amounts are what is left. Dinners are planned in order, so a later dinner can use an ingredient only up to the amount still left after earlier dinners.
- Use ingredients that expire soonest before ones that keep. Do not plan more of a pantry ingredient than the amount listed, and keep that ingredient's name and unit.

Safety and preferences:
- Never use a food the cook can't eat, including hidden in sauces, stocks, spice blends, or garnishes. Follow every dietary need.
- Avoid foods they dislike.
- Foods they enjoy are a hint about their taste, not a shopping list. Build at most one dinner around one of them; the rest should be dishes they'd probably like but haven't mentioned.

Format:
- Every recipe serves the number of people given, with quantities for that many servings.
- Ingredient names are plain grocery items in lowercase, like "yellow onion" or "chicken thighs". Prep goes in the steps, not the name.
- Quantities are numbers. Units are one of: ${UNITS.join(", ")}. Use "each" for whole items like eggs or lemons.
- Each ingredient's aisle is where a shopper finds it: produce (fresh fruit, vegetables, fresh herbs), meat-seafood, dairy-eggs (including cheese and butter), bakery (bread, tortillas, buns), pantry (grains, pasta, beans, canned goods, oils, vinegars, sauces, stock, baking supplies), spices (dried herbs, spices, salt, pepper), frozen, or other.
- Steps are short and plain, written for someone who isn't a trained cook.
- The summary is one friendly sentence about the dish.`;

const list = (items: string[]) => (items.length ? items.join(", ") : "none");

function formatPantryStock(stock: PantryStock[]) {
  return pantryForPlanning(stock)
    .map((item) => {
      const amount =
        item.unit === "each" ? `${formatGroceryAmount(item)} each` : formatGroceryAmount(item);
      const expires = item.expiresOn ? `, expires ${item.expiresOn}` : "";
      return `- ${item.name}: ${amount}${expires}`;
    })
    .join("\n");
}

function sessionLines(dinners: number, householdSize: number, nights: number[] | undefined) {
  const plan = Array.from({ length: dinners }, (_, index) => nights?.[index] ?? 1);
  if (plan.every((count) => count === 1)) {
    return `Plan ${dinners} ${dinners === 1 ? "dinner" : "dinners"} for ${householdSize} ${householdSize === 1 ? "person" : "people"}.`;
  }
  const people = `${householdSize} ${householdSize === 1 ? "person" : "people"}`;
  return [
    `Plan ${dinners} cooking ${dinners === 1 ? "session" : "sessions"} for ${people}.`,
    "Write every recipe for one dinner at that household size. Quantities are for one night only.",
    ...plan.map((count, index) => {
      const nightsLabel = count === 1 ? "1 night" : `${count} nights`;
      const pantryLimit =
        count > 1
          ? ` Use at most 1/${count} of each pantry amount, because the leftovers come from this cook.`
          : "";
      return `Session ${index + 1}: cooked once, eaten for ${nightsLabel}.${pantryLimit}`;
    }),
    "Pick food that keeps and reheats. Do not plan a separate recipe for a leftover night.",
  ].join("\n");
}

function describeRequest({
  dinners,
  householdSize,
  nights,
  preferences,
  pantry = [],
  mealDbCandidates = [],
  avoid = [],
  shopping = [],
}: PlanRequest) {
  // The hint spells out less familiar diets, e.g. "Jain (No meat or root vegetables)".
  const restrictions = DIETARY_RESTRICTIONS.filter((option) =>
    preferences.dietaryRestrictions.includes(option.value),
  ).map((option) => `${option.label} (${option.hint})`);

  return [
    sessionLines(dinners, householdSize, nights),
    `Dietary needs: ${list(restrictions)}`,
    `Can't eat: ${list(preferences.cannotEat)}`,
    `Dislikes: ${list(preferences.dislikes)}`,
    `Foods they enjoy (inspiration only): ${list(preferences.likes)}`,
    pantry.length
      ? `Pantry still on hand, soonest to expire first:\n${formatPantryStock(pantry)}`
      : "",
    mealDbCandidates.length
      ? `Prefer these MealDB meal ideas first because they already match pantry ingredients: ${mealDbCandidates.join("; ")}`
      : "",
    avoid.length ? `Don't plan any of these again: ${avoid.join("; ")}` : "",
    shopping.length
      ? `These dinners join a week already buying: ${shopping.join(", ")}. Reuse those ingredients where they fit.`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export const generateMeals: GenerateMeals = async (request) => {
  try {
    const { output } = await generateText({
      model: MODEL,
      // Planning dinners doesn't need extended thinking: with it off, a week
      // comes back in about 11s instead of 28s, at under half the cost, with
      // the same quality in our model comparison.
      reasoning: "low",
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
    // The fill-in dinners share the same shopping trip as the ones kept.
    const shopping = [...new Set(meals.flatMap((meal) => meal.ingredients.map((i) => i.name)))];
    add(
      await generate({
        ...request,
        dinners: request.dinners - meals.length,
        avoid: [...avoid],
        shopping,
        // The fill-in dinners can use only what the dinners already kept did not.
        nights: request.nights?.slice(meals.length),
        pantry: remainingPantry(
          request.pantry ?? [],
          meals.map((meal, index) => scaleMealQuantities(meal, request.nights?.[index] ?? 1)),
        ).filter((item) => item.quantity > 0),
      }),
    );
  }

  if (meals.length < Math.min(request.dinners, MIN_DINNERS_PER_WEEK)) return { ok: false };
  return { ok: true, meals: meals.slice(0, request.dinners) };
}
