import { describe, expect, it } from "vitest";
import type { Meal } from "@/lib/meal-plan";
import { cookingNights, mealsForWeek } from "./meal-prep";

const session = (title: string): Meal => ({
  title,
  summary: "A weeknight dinner.",
  totalMinutes: 35,
  servings: 2,
  ingredients: [{ name: "tortillas", quantity: 2, unit: "each", aisle: "bakery" }],
  steps: ["Cook it."],
});

describe("cookingNights", () => {
  it("gives every dinner its own cook when the days match", () => {
    expect(cookingNights(4, 4)).toEqual([1, 1, 1, 1]);
  });

  it("spreads dinners across fewer cooking days, extras first", () => {
    expect(cookingNights(5, 2)).toEqual([3, 2]);
    expect(cookingNights(7, 3)).toEqual([3, 2, 2]);
  });

  it("never plans more cooking days than dinners", () => {
    expect(cookingNights(5, 8)).toEqual([1, 1, 1, 1, 1]);
  });
});

describe("mealsForWeek", () => {
  it("lists one meal per cooking day, with enough food for the dinners it covers", () => {
    const week = mealsForWeek([session("Chicken tacos"), session("Turkey chili")], [3, 2]);

    expect(week.map((meal) => meal.title)).toEqual(["Chicken tacos", "Turkey chili"]);
    expect(week.map((meal) => meal.nights)).toEqual([3, 2]);
    // 2 people, so 3 dinners is 6 tortillas and 2 dinners is 4.
    expect(week[0].ingredients[0].quantity).toBe(6);
    expect(week[1].ingredients[0].quantity).toBe(4);
    expect(week[0].servings).toBe(2);
  });
});
