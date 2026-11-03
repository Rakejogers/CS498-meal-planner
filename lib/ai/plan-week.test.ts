import { describe, expect, it, vi } from "vitest";
import type { Meal } from "@/lib/meal-plan";
import { planWeek, type GenerateMeals, type PlanRequest } from "./plan-week";

vi.mock("server-only", () => ({}));

const meal = (title: string, ...ingredients: string[]): Meal => ({
  title,
  summary: "",
  totalMinutes: 30,
  servings: 2,
  ingredients: ingredients.map((name) => ({ name, quantity: 1, unit: "each" })),
  steps: ["Cook it."],
});

const request: PlanRequest = {
  dinners: 3,
  householdSize: 2,
  preferences: { dietaryRestrictions: [], cannotEat: ["shellfish"], dislikes: [], likes: [] },
};

const titles = (result: Awaited<ReturnType<typeof planWeek>>) =>
  result.ok ? result.meals.map((m) => m.title) : null;

describe("planWeek", () => {
  it("replaces a meal that uses a can't-eat food, telling the model to avoid it", async () => {
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
      expect.objectContaining({ dinners: 1, avoid: ["Tacos", "Curry", "Shrimp scampi"] }),
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
