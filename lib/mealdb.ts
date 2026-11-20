import "server-only";
import { normalizeFood } from "@/lib/preferences";

const MEAL_DB_API = "https://www.themealdb.com/api/json/v1/1";
const MAX_CANDIDATES = 12;

type MealDbListMeal = {
  idMeal: string;
  strMeal: string;
};

type MealDbFilterResponse = {
  meals: MealDbListMeal[] | null;
};

export type MealDbCandidate = {
  title: string;
  pantryOverlap: number;
  pantryIngredients: string[];
};

/** One ingredient search against MealDB's filter endpoint. */
export async function searchMealsByIngredient(ingredient: string): Promise<MealDbListMeal[]> {
  const response = await fetch(`${MEAL_DB_API}/filter.php?i=${encodeURIComponent(ingredient)}`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`MealDB ingredient search failed for ${ingredient}`);

  const body = (await response.json()) as MealDbFilterResponse;
  return body.meals ?? [];
}

/**
 * Deduplicates MealDB matches and ranks them by how many pantry ingredients
 * they reuse, breaking ties alphabetically for stable plans.
 */
export function rankMealDbCandidates(
  results: Array<{ ingredient: string; meals: MealDbListMeal[] }>,
): MealDbCandidate[] {
  const byId = new Map<string, MealDbCandidate & { id: string }>();

  for (const { ingredient, meals } of results) {
    const normalizedIngredient = normalizeFood(ingredient);
    if (!normalizedIngredient) continue;

    for (const meal of meals) {
      const existing = byId.get(meal.idMeal);
      if (existing) {
        if (!existing.pantryIngredients.includes(normalizedIngredient)) {
          existing.pantryIngredients.push(normalizedIngredient);
          existing.pantryOverlap += 1;
        }
        continue;
      }

      byId.set(meal.idMeal, {
        id: meal.idMeal,
        title: meal.strMeal.trim(),
        pantryOverlap: 1,
        pantryIngredients: [normalizedIngredient],
      });
    }
  }

  return [...byId.values()]
    .sort(
      (a, b) =>
        b.pantryOverlap - a.pantryOverlap ||
        a.title.localeCompare(b.title, "en", { sensitivity: "base" }),
    )
    .slice(0, MAX_CANDIDATES)
    .map(({ id: _id, ...candidate }) => candidate);
}

/**
 * Meal ideas from TheMealDB based on ingredients the user already has. Failures
 * stay local to the API lookup so weekly planning can still continue.
 */
export async function mealDbCandidatesFromPantry(
  pantry: string[],
  search: (ingredient: string) => Promise<MealDbListMeal[]> = searchMealsByIngredient,
) {
  const ingredients = [
    ...new Set(
      pantry.flatMap((name) => {
        const normalized = normalizeFood(name);
        return normalized ? [normalized] : [];
      }),
    ),
  ];
  const searches = await Promise.allSettled(
    ingredients.map(async (ingredient) => ({
      ingredient,
      meals: await search(ingredient),
    })),
  );

  const successful = searches.flatMap((result) => {
    if (result.status === "fulfilled") return [result.value];
    console.error("MealDB pantry search failed:", result.reason);
    return [];
  });

  return rankMealDbCandidates(successful);
}
