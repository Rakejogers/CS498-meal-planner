import { describe, expect, it } from "vitest";
import { cleanFoodLists, foodPreferencesSchema } from "./preferences";

describe("cleanFoodLists", () => {
  it("treats differently typed names as the same food", () => {
    const { dislikes } = cleanFoodLists({
      cannotEat: [],
      dislikes: ["Spicy  Food", " spicy food ", "  "],
      likes: [],
    });

    expect(dislikes).toEqual(["spicy food"]);
  });

  it("keeps a food in the strictest list it appears in", () => {
    // A liked food that is also an allergy must never reach the planner as a like.
    expect(
      cleanFoodLists({
        cannotEat: ["shrimp"],
        dislikes: ["Shrimp", "olives"],
        likes: ["olives", "shrimp", "pasta"],
      }),
    ).toEqual({ cannotEat: ["shrimp"], dislikes: ["olives"], likes: ["pasta"] });
  });
});

describe("foodPreferencesSchema", () => {
  it("drops dietary restrictions the app doesn't offer", () => {
    const parsed = foodPreferencesSchema.parse({
      dietaryRestrictions: ["vegan", "carnivore"],
      cannotEat: [],
      dislikes: [],
      likes: [],
    });

    expect(parsed.dietaryRestrictions).toEqual(["vegan"]);
  });
});
