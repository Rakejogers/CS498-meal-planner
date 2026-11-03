import { describe, expect, it } from "vitest";
import {
  currentWeekStart,
  localDate,
  removeUnsafeMeals,
  upcomingWeekStart,
  type Meal,
} from "./meal-plan";

const meal = (title: string, ...ingredients: string[]): Meal => ({
  title,
  summary: "",
  totalMinutes: 30,
  servings: 2,
  ingredients: ingredients.map((name) => ({ name, quantity: 1, unit: "each" })),
  steps: ["Cook it."],
});

const titles = (meals: Meal[]) => meals.map((m) => m.title);

describe("removeUnsafeMeals", () => {
  it("removes meals that use a can't-eat food under another name or form", () => {
    const { safe, removed } = removeUnsafeMeals(
      [
        meal("Satay noodles", "Peanut butter", "rice noodles"),
        meal("Garlic scampi", "shrimp", "linguine"),
        meal("Bean chili", "black beans", "tomatoes"),
      ],
      { cannotEat: ["peanuts", "shellfish"], dietaryRestrictions: [] },
    );

    expect(titles(safe)).toEqual(["Bean chili"]);
    expect(removed.map((r) => r.food)).toEqual(["peanuts", "shrimp"]);
  });

  it("applies allergy restrictions without blocking foods that only share letters", () => {
    const { safe } = removeUnsafeMeals(
      [
        meal("Eggplant parm", "eggplant"),
        meal("Fried rice", "rice", "eggs"),
        meal("Pesto", "pine nuts"),
      ],
      { cannotEat: [], dietaryRestrictions: ["egg-free", "nut-free"] },
    );

    expect(titles(safe)).toEqual(["Eggplant parm"]);
  });
});

describe("localDate", () => {
  it("uses the date in the time zone, which can differ from the server's UTC date", () => {
    expect(localDate(new Date("2026-11-03T02:00:00Z"), "America/New_York")).toBe("2026-11-02");
  });
});

describe("currentWeekStart", () => {
  it("counts Sunday as the end of the week, not the start", () => {
    expect(currentWeekStart("2026-10-26")).toBe("2026-10-26"); // Monday
    expect(currentWeekStart("2026-10-27")).toBe("2026-10-26"); // Tuesday
    expect(currentWeekStart("2026-11-01")).toBe("2026-10-26"); // Sunday
  });
});

describe("upcomingWeekStart", () => {
  it("plans for this Monday on a Monday and the next Monday otherwise", () => {
    expect(upcomingWeekStart("2026-10-26")).toBe("2026-10-26"); // Monday
    expect(upcomingWeekStart("2026-10-25")).toBe("2026-10-26"); // Sunday
    expect(upcomingWeekStart("2026-10-27")).toBe("2026-11-02"); // Tuesday
  });

  it("rolls over the end of the year", () => {
    expect(upcomingWeekStart("2026-12-31")).toBe("2027-01-04");
  });
});
