import type { GenerateMeals } from "./plan-week";

/**
 * Stands in for the model when PLAN_GENERATOR=fake, which is how Playwright
 * starts the app: end-to-end tests stay free, fast, and repeatable, and CI
 * needs no API key.
 */
export const fakeMeals: GenerateMeals = async ({ dinners, householdSize, avoid = [] }) =>
  Array.from({ length: dinners }, (_, index) => ({
    title: `Test dinner ${avoid.length + index + 1}`,
    summary: "A dinner for tests.",
    totalMinutes: 30,
    servings: householdSize,
    ingredients: [
      { name: "rice", quantity: 1, unit: "cup" },
      { name: "black beans", quantity: 1, unit: "can" },
    ],
    steps: ["Cook the rice.", "Warm the beans."],
  }));
