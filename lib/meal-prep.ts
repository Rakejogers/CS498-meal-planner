import type { Meal } from "@/lib/meal-plan";
import { MAX_MEALS_PER_WEEK, MIN_MEALS_PER_WEEK } from "@/lib/household";

// How a week of dinners is split across fewer cooking days. The first sessions
// take the extra nights, so 5 dinners over 2 days is 3 nights then 2.

export function cookingNights(mealsPerWeek: number, cookingDays: number) {
  const meals = Math.min(MAX_MEALS_PER_WEEK, Math.max(MIN_MEALS_PER_WEEK, mealsPerWeek));
  const days = Math.min(meals, Math.max(MIN_MEALS_PER_WEEK, cookingDays));
  const base = Math.floor(meals / days);
  let extra = meals % days;
  return Array.from({ length: days }, () => {
    const nights = base + (extra > 0 ? 1 : 0);
    if (extra > 0) extra -= 1;
    return nights;
  });
}

/** One dinner's quantities, multiplied for the nights that cook covers. */
export function scaleMealQuantities(meal: Meal, nights: number): Meal {
  if (nights <= 1) return meal;
  return {
    ...meal,
    ingredients: meal.ingredients.map((ingredient) => ({
      ...ingredient,
      quantity: Math.round(ingredient.quantity * nights * 100) / 100,
    })),
  };
}

export type DraftMeal = Meal & {
  /** How many dinners this cook covers. One, unless this batch is meal prep. */
  nights: number;
  /** The grocery list buys every cook. Kept so older leftover rows can be skipped. */
  countsForGroceries: boolean;
};

/**
 * The meals to show for the week: one card per day they cook. A batch's
 * ingredient amounts cover every dinner that cook feeds, for the household
 * size already on the recipe. Leftover nights are not separate meals.
 */
export function mealsForWeek(sessions: readonly Meal[], nights: readonly number[]): DraftMeal[] {
  return sessions.map((meal, index) => {
    const count = nights[index] ?? 1;
    return {
      ...scaleMealQuantities(meal, count),
      nights: count,
      countsForGroceries: true,
    };
  });
}
