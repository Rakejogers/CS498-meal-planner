"use server";

import { revalidatePath } from "next/cache";
import { planWeek } from "@/lib/ai/plan-week";
import { getFoodPreferences, getMealPlan, getProfile, saveMealPlan } from "@/lib/data";
import { localDate, upcomingWeekStart } from "@/lib/meal-plan";

export type PlanFormState = {
  error?: string;
};

const PLAN_FAILED = "We couldn't plan your dinners. Please try again.";

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
