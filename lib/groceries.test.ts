import { describe, expect, it } from "vitest";
import { combineGroceries, formatGroceryAmount, groupByAisle } from "./groceries";
import type { Aisle, Ingredient, Unit } from "./meal-plan";

const ingredient = (name: string, quantity: number, unit: Unit, aisle: Aisle = "pantry") =>
  ({ name, quantity, unit, aisle }) satisfies Ingredient;
const meal = (...ingredients: Ingredient[]) => ({ ingredients });

describe("combineGroceries", () => {
  it("adds up an ingredient across meals, matching names on case and spacing", () => {
    const items = combineGroceries([
      meal(ingredient("Yellow  onion", 1, "each", "produce")),
      meal(ingredient("rice", 1, "cup")),
      meal(ingredient("yellow onion", 2, "each", "produce")),
    ]);
    expect(items).toEqual([
      { name: "rice", amounts: [{ quantity: 1, unit: "cup" }], aisle: "pantry", meals: [1] },
      {
        name: "yellow onion",
        amounts: [{ quantity: 3, unit: "each" }],
        aisle: "produce",
        meals: [0, 2],
      },
    ]);
  });

  it("converts within weight and within volume, but never volume into weight", () => {
    const [oil] = combineGroceries([
      meal(ingredient("oil", 1, "cup"), ingredient("oil", 100, "g")),
      meal(ingredient("oil", 16, "tbsp"), ingredient("oil", 1, "lb")),
    ]);
    expect(oil.amounts).toHaveLength(2);
    expect(oil.amounts[0].unit).toBe("cup");
    expect(oil.amounts[0].quantity).toBeCloseTo(2);
    expect(oil.amounts[1].unit).toBe("g");
    expect(oil.amounts[1].quantity).toBeCloseTo(553.59237);
  });

  it("keeps different ingredients and different packages separate", () => {
    const items = combineGroceries([
      meal(
        ingredient("garlic", 2, "clove"),
        ingredient("garlic powder", 0.5, "tsp"),
        ingredient("tomatoes", 1, "can"),
        ingredient("tomatoes", 2, "each"),
      ),
    ]);
    expect(items.map(({ name, amounts }) => [name, amounts.length])).toEqual([
      ["garlic", 1],
      ["garlic powder", 1],
      ["tomatoes", 2],
    ]);
  });
});

describe("groupByAisle", () => {
  it("orders aisles the way a store is walked and leaves out empty ones", () => {
    const items = combineGroceries([
      meal(
        ingredient("cumin", 1, "tsp", "spices"),
        ingredient("lime", 1, "each", "produce"),
        ingredient("rice", 1, "cup", "pantry"),
        ingredient("cilantro", 1, "bunch", "produce"),
      ),
    ]);
    expect(
      groupByAisle(items).map(({ aisle, items }) => [aisle, items.map((i) => i.name)]),
    ).toEqual([
      ["produce", ["cilantro", "lime"]],
      ["pantry", ["rice"]],
      ["spices", ["cumin"]],
    ]);
  });
});

describe("formatGroceryAmount", () => {
  it("hides floating point noise without rounding small amounts to zero", () => {
    expect(formatGroceryAmount({ quantity: 0.1 + 0.2, unit: "tbsp" })).toBe("0.3 tbsp");
    expect(formatGroceryAmount({ quantity: 0.0013, unit: "tsp" })).toBe("0.0013 tsp");
  });

  it("pluralizes word units but not abbreviations or whole items", () => {
    expect(formatGroceryAmount({ quantity: 1, unit: "can" })).toBe("1 can");
    // Rounds to 1 for display, so it reads as one.
    expect(formatGroceryAmount({ quantity: 1.0001, unit: "cup" })).toBe("1 cup");
    expect(formatGroceryAmount({ quantity: 2, unit: "bunch" })).toBe("2 bunches");
    expect(formatGroceryAmount({ quantity: 2, unit: "lb" })).toBe("2 lb");
    expect(formatGroceryAmount({ quantity: 3, unit: "each" })).toBe("3");
  });
});
