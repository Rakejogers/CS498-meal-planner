"use server";

import { revalidatePath } from "next/cache";
import { planWeek } from "@/lib/ai/plan-week";
import {
  getFoodPreferences,
  getMealPlan,
  getPantryItems,
  getProfile,
  saveMealPlan,
} from "@/lib/data";
import { mealDbCandidatesFromPantry } from "@/lib/mealdb";
import { cookingNights, mealsForWeek } from "@/lib/meal-prep";
import { localDate, upcomingWeekStart } from "@/lib/meal-plan";
import { pantryForPlanning } from "@/lib/pantry";

export type PlanFormState = {
  error?: string;
};

const PLAN_FAILED = "We couldn't plan your dinners. Please try again.";

// Everything the plan is based on comes from the signed-in user's saved
// settings, so the form sends nothing.
export async function generatePlan(): Promise<PlanFormState> {
  const today = localDate(new Date());
  const [{ householdSize, mealsPerWeek, cookingDays }, preferences, shownPlan, pantryItems] =
    await Promise.all([getProfile(), getFoodPreferences(), getMealPlan(today), getPantryItems()]);
  const pantry = pantryForPlanning(pantryItems);
  const mealDbCandidates = pantry.length
    ? await mealDbCandidatesFromPantry(pantry.map((item) => item.name))
    : [];

  const nights = cookingNights(mealsPerWeek, cookingDays);
  const plan = await planWeek({
    dinners: nights.length,
    nights,
    householdSize,
    preferences,
    pantry,
    mealDbCandidates: mealDbCandidates.map((candidate) => candidate.title),
    // Asking again should bring different dinners, not the same ones.
    avoid: shownPlan?.meals.map((meal) => meal.title),
  });
  if (!plan.ok) return { error: PLAN_FAILED };

  // New dinners replace the plan on screen; a first plan is for next week.
  const weekStart = shownPlan?.weekStart ?? upcomingWeekStart(today);
  const { ok } = await saveMealPlan(weekStart, mealsForWeek(plan.meals, nights));
  if (!ok) return { error: PLAN_FAILED };

  revalidatePath("/dashboard");
  return {};
}
