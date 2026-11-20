"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { planWeek } from "@/lib/ai/plan-week";
import { getFoodPreferences, getMealPlan, getProfile, saveMealPlan } from "@/lib/data";
import { localDate, upcomingWeekStart } from "@/lib/meal-plan";

export type PlanFormState = {
  error?: string;
};

const PLAN_FAILED = "We couldn't plan your dinners. Please try again.";

const swapFormSchema = z.object({ mealId: z.string().uuid() });

// Everything the plan is based on comes from the signed-in user's saved
// settings, so the form sends nothing.
export async function generatePlan(): Promise<PlanFormState> {
  const today = localDate(new Date());
  const [{ householdSize, mealsPerWeek }, preferences, shownPlan] = await Promise.all([
    getProfile(),
    getFoodPreferences(),
    getMealPlan(today),
  ]);

  const plan = await planWeek({
    dinners: mealsPerWeek,
    householdSize,
    preferences,
    // Asking again should bring different dinners, not the same ones.
    avoid: shownPlan?.meals.map((meal) => meal.title),
  });
  if (!plan.ok) return { error: PLAN_FAILED };

  // New dinners replace the plan on screen; a first plan is for next week.
  const weekStart = shownPlan?.weekStart ?? upcomingWeekStart(today);
  const { ok } = await saveMealPlan(weekStart, plan.meals);
  if (!ok) return { error: PLAN_FAILED };

  revalidatePath("/dashboard");
  return {};
}

/** Generates one replacement for a dinner in the signed-in user's current plan. */
export async function swapMeal(
  _previousState: PlanFormState,
  formData: FormData,
): Promise<PlanFormState> {
  const input = swapFormSchema.safeParse({ mealId: formData.get("mealId") });
  if (!input.success) return { error: PLAN_FAILED };

  const today = localDate(new Date());
  const [{ householdSize }, preferences, plan] = await Promise.all([
    getProfile(),
    getFoodPreferences(),
    getMealPlan(today),
  ]);
  const index = plan?.meals.findIndex((meal) => meal.id === input.data.mealId) ?? -1;
  if (!plan || index < 0) return { error: PLAN_FAILED };

  const replacement = await planWeek({
    dinners: 1,
    householdSize,
    preferences,
    avoid: plan.meals.map((meal) => meal.title),
    shopping: plan.meals
      .filter((_, mealIndex) => mealIndex !== index)
      .flatMap((meal) => meal.ingredients.map((ingredient) => ingredient.name)),
  });
  if (!replacement.ok) return { error: PLAN_FAILED };

  const meals = plan.meals.map((meal, mealIndex) => {
    if (mealIndex === index) return replacement.meals[0];
    return {
      title: meal.title,
      summary: meal.summary,
      totalMinutes: meal.totalMinutes,
      servings: meal.servings,
      ingredients: meal.ingredients,
      steps: meal.steps,
    };
  });
  const { ok } = await saveMealPlan(plan.weekStart, meals);
  if (!ok) return { error: PLAN_FAILED };

  revalidatePath("/dashboard");
  revalidatePath("/groceries");
  return {};
}
