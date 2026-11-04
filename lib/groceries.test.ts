import { describe, expect, it } from "vitest";
import {
  combineGroceries,
  formatGroceryAmount,
  parseGroceryMealForm,
  parseQuantity,
  type GroceryMeal,
} from "./groceries";

const meal = (overrides: Partial<GroceryMeal> = {}): GroceryMeal => ({
  id: "meal-1",
  title: "Pasta",
  recipeServings: 2,
  plannedServings: 4,
  included: true,
  ingredients: [{ name: "Pasta", quantity: 100, unit: "g" }],
  ...overrides,
});

describe("combined grocery requirements", () => {
  it("scales each recipe before combining duplicate names and unit aliases", () => {
    const items = combineGroceries([
      meal(),
      meal({
        id: "meal-2",
        title: "Pasta salad",
        recipeServings: 4,
        plannedServings: 2,
        ingredients: [{ name: "  PASTA  ", quantity: 0.4, unit: "kilograms" }],
      }),
    ]);
    expect(items).toEqual([
      {
        name: "pasta",
        amounts: [{ quantity: 400, unit: "g" }],
        meals: [
          { id: "meal-1", title: "Pasta" },
          { id: "meal-2", title: "Pasta salad" },
        ],
      },
    ]);
  });

  it("excludes meals that aren't approved for the list and handles an empty plan", () => {
    expect(combineGroceries([meal({ included: false })])).toEqual([]);
    expect(combineGroceries([])).toEqual([]);
  });

  it("converts US volume and weight without converting volume into weight", () => {
    const [oil] = combineGroceries([
      meal({
        recipeServings: 4,
        ingredients: [
          { name: "Oil", quantity: 1, unit: "cup" },
          { name: "oil", quantity: 16, unit: "tablespoons" },
          { name: "oil", quantity: 100, unit: "grams" },
          { name: "oil", quantity: 1, unit: "lb" },
        ],
      }),
    ]);
    expect(oil.amounts[0].quantity).toBeCloseTo(2);
    expect(oil.amounts[1].quantity).toBeCloseTo(553.59237);
    expect(oil.meals).toHaveLength(1);
  });

  it("retains unknown amounts and incompatible package sizes without guessing", () => {
    const [tomatoes] = combineGroceries([
      meal({
        recipeServings: 4,
        ingredients: [
          { name: "Tomatoes", quantity: 1, unit: "can" },
          { name: "tomatoes", quantity: 2, unit: "cans" },
          { name: "tomatoes", quantity: 400, unit: "g" },
          { name: "tomatoes", quantity: null, unit: "" },
        ],
      }),
    ]);
    expect(tomatoes.amounts).toEqual([
      { quantity: 3, unit: "can" },
      { quantity: 400, unit: "g" },
      { quantity: null, unit: "each" },
    ]);
  });

  it("keeps distinct ingredients separate and doesn't modify recipe data", () => {
    const recipe = meal({
      ingredients: [
        { name: "Garlic", quantity: 2, unit: "cloves" },
        { name: "Garlic powder", quantity: 0.5, unit: "tsp" },
      ],
    });
    const before = structuredClone(recipe);
    expect(combineGroceries([recipe]).map(({ name }) => name)).toEqual(["garlic", "garlic powder"]);
    expect(recipe).toEqual(before);
  });

  it("doesn't show floating point artifacts or round small requirements to zero", () => {
    const [item] = combineGroceries([
      meal({
        recipeServings: 4,
        ingredients: [
          { name: "salt", quantity: 0.1, unit: "g" },
          { name: "salt", quantity: 0.2, unit: "g" },
        ],
      }),
    ]);
    expect(formatGroceryAmount(item.amounts[0])).toBe("0.3 g");
    expect(formatGroceryAmount({ quantity: 0.0001, unit: "g" })).toBe("0.0001 g");
  });
});

describe("recipe quantity parsing", () => {
  it("reads decimal, fraction, and mixed amounts and rejects malformed fractions", () => {
    expect(parseQuantity(" .5 ")).toBe(0.5);
    expect(parseQuantity("1/2")).toBe(0.5);
    expect(parseQuantity("1 1/2")).toBe(1.5);
    expect(parseQuantity("")).toBeNull();
    for (const value of ["1/0", "1/2/3", "-1", "NaN", "1 cup", "1e3"])
      expect(parseQuantity(value)).toBeUndefined();
  });

  it("rejects a partial ingredient row instead of silently omitting its requirement", () => {
    const form = new FormData();
    form.set("title", "Pasta");
    form.set("recipeServings", "2");
    form.set("plannedServings", "4");
    form.set("included", "true");
    form.append("ingredientName", "Pasta");
    form.append("quantity", "1/2");
    form.append("unit", "kg");
    expect(parseGroceryMealForm(form).success).toBe(true);
    form.append("ingredientName", "Salt");
    expect(parseGroceryMealForm(form).success).toBe(false);
  });
});
