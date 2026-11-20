import { describe, expect, it, vi } from "vitest";
import type { Meal } from "@/lib/meal-plan";
import { planWeek, type GenerateMeals, type PlanRequest } from "./plan-week";

vi.mock("server-only", () => ({}));

const meal = (title: string, ...ingredients: string[]): Meal => ({
  title,
  summary: "",
  totalMinutes: 30,
  servings: 2,
  ingredients: ingredients.map((name) => ({ name, quantity: 1, unit: "each", aisle: "other" })),
  steps: ["Cook it."],
});

const request: PlanRequest = {
  dinners: 3,
  householdSize: 2,
  preferences: { dietaryRestrictions: [], cannotEat: ["shellfish"], dislikes: [], likes: [] },
  pantry: [
    { name: "tortillas", quantity: 8, unit: "each", expiresOn: "2026-11-20", state: "have" },
    { name: "coconut milk", quantity: 1, unit: "can", expiresOn: null, state: "have" },
  ],
  mealDbCandidates: ["Chicken fajitas", "Chickpea curry"],
};

const titles = (result: Awaited<ReturnType<typeof planWeek>>) =>
  result.ok ? result.meals.map((m) => m.title) : null;

describe("planWeek", () => {
  it("replaces a meal that uses a can't-eat food, telling the model to avoid it and reuse the week's ingredients", async () => {
    const generate = vi
      .fn<GenerateMeals>()
      .mockResolvedValueOnce([
        meal("Tacos", "tortillas"),
        meal("Shrimp scampi", "shrimp"),
        meal("Curry", "chickpeas"),
      ])
      .mockResolvedValueOnce([meal("Risotto", "arborio rice")]);

    const result = await planWeek(request, generate);

    expect(titles(result)).toEqual(["Tacos", "Curry", "Risotto"]);
    expect(generate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        dinners: 1,
        avoid: ["Tacos", "Curry", "Shrimp scampi"],
        pantry: [
          { name: "tortillas", quantity: 7, unit: "each", expiresOn: "2026-11-20", state: "have" },
          { name: "coconut milk", quantity: 1, unit: "can", expiresOn: null, state: "have" },
        ],
        mealDbCandidates: ["Chicken fajitas", "Chickpea curry"],
        // The fill-in shares the week's shopping with the dinners kept.
        shopping: ["tortillas", "chickpeas"],
      }),
    );
  });

  it("holds back a cooking session's leftovers before planning the next one", async () => {
    const generate = vi
      .fn<GenerateMeals>()
      .mockResolvedValueOnce([meal("Tacos", "tortillas")])
      .mockResolvedValueOnce([meal("Soup", "broth")]);

    const result = await planWeek({ ...request, dinners: 2, nights: [3, 2] }, generate);

    expect(titles(result)).toEqual(["Tacos", "Soup"]);
    expect(generate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        dinners: 1,
        nights: [2],
        pantry: [
          { name: "tortillas", quantity: 5, unit: "each", expiresOn: "2026-11-20", state: "have" },
          { name: "coconut milk", quantity: 1, unit: "can", expiresOn: null, state: "have" },
        ],
      }),
    );
  });

  it("fails instead of returning a short week when the retry doesn't help", async () => {
    const generate = vi
      .fn<GenerateMeals>()
      .mockResolvedValueOnce([meal("Tacos", "tortillas"), meal("Crab cakes", "crab")])
      .mockResolvedValueOnce(null);

    expect(await planWeek(request, generate)).toEqual({ ok: false });
  });
});
