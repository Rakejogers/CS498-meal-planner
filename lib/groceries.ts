import { AISLES, type Aisle, type Meal, type Unit } from "@/lib/meal-plan";
import { normalizeFood } from "@/lib/preferences";

// The grocery list: every ingredient from a week's planned meals, with
// duplicates added up. Pure functions so the math is unit-tested.

export type GroceryAmount = { quantity: number; unit: Unit };
export type GroceryItem = {
  name: string;
  /** One amount per kind of measure: weight, volume, or a count of something. */
  amounts: GroceryAmount[];
  /** Where it is in the store, from the first meal that lists it. */
  aisle: Aisle;
  /** Which meals need it, as their positions in the plan (0 is the first). */
  meals: number[];
};

// Amounts in the same family add up; `factor` converts to the family's base
// unit (grams or milliliters). Never convert volume into weight: that needs a
// density per ingredient. Cups and spoons are US measures.
const UNIT_FAMILIES: Record<Unit, { family: string; factor: number }> = {
  g: { family: "weight", factor: 1 },
  kg: { family: "weight", factor: 1000 },
  oz: { family: "weight", factor: 28.349523125 },
  lb: { family: "weight", factor: 453.59237 },
  ml: { family: "volume", factor: 1 },
  l: { family: "volume", factor: 1000 },
  tsp: { family: "volume", factor: 4.92892159375 },
  tbsp: { family: "volume", factor: 14.78676478125 },
  cup: { family: "volume", factor: 236.5882365 },
  pinch: { family: "pinch", factor: 1 },
  each: { family: "each", factor: 1 },
  clove: { family: "clove", factor: 1 },
  slice: { family: "slice", factor: 1 },
  can: { family: "can", factor: 1 },
  bunch: { family: "bunch", factor: 1 },
};

/**
 * Combines the ingredients of `meals` into one list, sorted by name. Names
 * match on case and spacing only, so garlic and garlic powder stay separate.
 * An amount keeps the unit it was first listed in.
 */
export function combineGroceries(meals: readonly Pick<Meal, "ingredients">[]) {
  const items = new Map<string, GroceryItem>();
  meals.forEach((meal, position) => {
    for (const ingredient of meal.ingredients) {
      const name = normalizeFood(ingredient.name);
      let item = items.get(name);
      if (!item) {
        item = { name, amounts: [], aisle: ingredient.aisle, meals: [] };
        items.set(name, item);
      }
      if (!item.meals.includes(position)) item.meals.push(position);

      const { family, factor } = UNIT_FAMILIES[ingredient.unit];
      const same = item.amounts.find((amount) => UNIT_FAMILIES[amount.unit].family === family);
      if (same) same.quantity += (ingredient.quantity * factor) / UNIT_FAMILIES[same.unit].factor;
      else item.amounts.push({ quantity: ingredient.quantity, unit: ingredient.unit });
    }
  });
  return [...items.values()].sort((a, b) => a.name.localeCompare(b.name, "en"));
}

export const AISLE_LABELS: Record<Aisle, string> = {
  produce: "Produce",
  "meat-seafood": "Meat & seafood",
  "dairy-eggs": "Dairy & eggs",
  bakery: "Bakery",
  pantry: "Pantry",
  spices: "Spices & seasonings",
  frozen: "Frozen",
  other: "Everything else",
};

/** `items` split by aisle, in store order. Aisles with nothing on the list are left out. */
export function groupByAisle(items: readonly GroceryItem[]) {
  return AISLES.map((aisle) => ({
    aisle,
    items: items.filter((item) => item.aisle === aisle),
  })).filter((group) => group.items.length > 0);
}

// Units spelled as words read better in the plural: "2 cans", not "2 can".
const PLURALS: Partial<Record<Unit, string>> = {
  cup: "cups",
  clove: "cloves",
  slice: "slices",
  can: "cans",
  bunch: "bunches",
  pinch: "pinches",
};

/** "1.5 cups", "200 g", or just "3" for whole items. Rounds for display only. */
export function formatGroceryAmount({ quantity, unit }: GroceryAmount) {
  const number = new Intl.NumberFormat(
    "en-US",
    quantity < 0.01 ? { maximumSignificantDigits: 2 } : { maximumFractionDigits: 2 },
  ).format(quantity);
  if (unit === "each") return number;
  return `${number} ${number !== "1" && PLURALS[unit] ? PLURALS[unit] : unit}`;
}

/** The list as plain text by aisle, for copying into a notes app. */
export function groceryListText(items: readonly GroceryItem[]) {
  const lines = ["My Plantry grocery list"];
  for (const group of groupByAisle(items)) {
    lines.push("", AISLE_LABELS[group.aisle]);
    for (const item of group.items) {
      lines.push(`- ${item.name}: ${item.amounts.map(formatGroceryAmount).join(" + ")}`);
    }
  }
  return lines.join("\n");
}
