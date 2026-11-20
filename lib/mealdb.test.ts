import { describe, expect, it, vi } from "vitest";
import { mealDbCandidatesFromPantry, rankMealDbCandidates } from "./mealdb";

vi.mock("server-only", () => ({}));

describe("rankMealDbCandidates", () => {
  it("sorts meals by pantry overlap and deduplicates repeated matches", () => {
    expect(
      rankMealDbCandidates([
        {
          ingredient: "spinach",
          meals: [
            { idMeal: "1", strMeal: "Palak Paneer" },
            { idMeal: "2", strMeal: "Creamy Pasta" },
          ],
        },
        {
          ingredient: "paneer",
          meals: [
            { idMeal: "1", strMeal: "Palak Paneer" },
            { idMeal: "3", strMeal: "Paneer Tikka" },
          ],
        },
      ]),
    ).toEqual([
      { title: "Palak Paneer", pantryOverlap: 2, pantryIngredients: ["spinach", "paneer"] },
      { title: "Creamy Pasta", pantryOverlap: 1, pantryIngredients: ["spinach"] },
      { title: "Paneer Tikka", pantryOverlap: 1, pantryIngredients: ["paneer"] },
    ]);
  });
});

describe("mealDbCandidatesFromPantry", () => {
  it("keeps successful ingredient lookups when one MealDB call fails", async () => {
    const search = vi.fn(async (ingredient: string) => {
      if (ingredient === "spinach") throw new Error("down");
      return [{ idMeal: "2", strMeal: "Lemon chicken" }];
    });

    await expect(mealDbCandidatesFromPantry(["spinach", "chicken"], search)).resolves.toEqual([
      { title: "Lemon chicken", pantryOverlap: 1, pantryIngredients: ["chicken"] },
    ]);
  });
});
