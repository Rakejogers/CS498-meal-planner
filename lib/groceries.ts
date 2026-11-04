import { z } from "zod";
import { householdSizeSchema } from "@/lib/household";

const cleanText = (value: string) => value.trim().replace(/\s+/g, " ");
const ingredientName = z.string().transform(cleanText).pipe(z.string().min(1).max(100));

export const groceryIngredientsSchema = z
  .array(
    z.object({
      name: ingredientName,
      quantity: z.number().positive().max(1_000_000).nullable(),
      unit: z.string().transform(cleanText).pipe(z.string().max(30)),
    }),
  )
  .min(1)
  .max(50);

export const groceryMealSchema = z.object({
  title: z.string().transform(cleanText).pipe(z.string().min(1).max(100)),
  recipeServings: z.coerce.number().int().min(1).max(100),
  plannedServings: householdSizeSchema,
  included: z.boolean(),
  ingredients: groceryIngredientsSchema,
});

export type GroceryMealInput = z.infer<typeof groceryMealSchema>;
export type GroceryMeal = GroceryMealInput & { id: string };
export type GroceryAmount = { quantity: number | null; unit: string };
export type GroceryItem = {
  name: string;
  amounts: GroceryAmount[];
  meals: { id: string; title: string }[];
};

/** Blank means an unspecified amount; malformed input must never become zero. */
export function parseQuantity(value: string): number | null | undefined {
  const text = value.trim();
  if (!text) return null;
  if (/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(text)) return Number(text);
  const fraction = /^(?:(\d+)\s+)?(\d+)\s*\/\s*(\d+)$/.exec(text);
  if (!fraction || Number(fraction[3]) === 0) return undefined;
  return Number(fraction[1] ?? 0) + Number(fraction[2]) / Number(fraction[3]);
}

/** Read parallel ingredient fields without dropping incomplete rows. */
export function parseGroceryMealForm(form: FormData) {
  const names = form.getAll("ingredientName");
  const quantities = form.getAll("quantity");
  const units = form.getAll("unit");
  return groceryMealSchema.safeParse({
    title: form.get("title"),
    recipeServings: form.get("recipeServings"),
    plannedServings: form.get("plannedServings"),
    included:
      form.get("included") === "true" ? true : form.get("included") === "false" ? false : undefined,
    ingredients:
      names.length === quantities.length && names.length === units.length
        ? names.map((name, index) => ({
            name,
            quantity:
              typeof quantities[index] === "string" ? parseQuantity(quantities[index]) : undefined,
            unit: units[index],
          }))
        : [],
  });
}

type Unit = { label: string; family: string; factor: number };
const units = new Map<string, Unit>();
function register(label: string, family: string, factor: number, aliases: string[]) {
  for (const alias of [label, ...aliases]) units.set(alias, { label, family, factor });
}

register("g", "mass", 1, ["gram", "grams"]);
register("kg", "mass", 1000, ["kilogram", "kilograms"]);
register("oz", "mass", 28.349523125, ["ounce", "ounces"]);
register("lb", "mass", 453.59237, ["lbs", "pound", "pounds"]);
register("ml", "volume", 1, ["milliliter", "milliliters", "millilitre", "millilitres"]);
register("l", "volume", 1000, ["liter", "liters", "litre", "litres"]);
// US customary measures. Never infer a density to convert volume into weight.
register("tsp", "volume", 4.92892159375, ["teaspoon", "teaspoons"]);
register("tbsp", "volume", 14.78676478125, ["tablespoon", "tablespoons"]);
register("cup", "volume", 236.5882365, ["cups"]);
register("fl oz", "volume", 29.5735295625, ["fluid ounce", "fluid ounces"]);
register("each", "count", 1, ["", "item", "items"]);
for (const label of ["can", "clove", "bunch", "package", "slice"]) {
  register(label, `custom:${label}`, 1, [label === "bunch" ? "bunches" : `${label}s`]);
}

function normalize(value: string) {
  return cleanText(value.normalize("NFKC")).toLowerCase();
}

function resolveUnit(value: string): Unit {
  const key = normalize(value);
  return units.get(key) ?? { label: key, family: `custom:${key}`, factor: 1 };
}

/**
 * Shared entry point for manual recipes and future generated meal plans.
 * Ingredient identity is deliberately conservative: case/spacing only, no fuzzy
 * matching (garlic and garlic powder must remain different ingredients).
 */
export function combineGroceries(meals: readonly GroceryMeal[]): GroceryItem[] {
  const items = new Map<
    string,
    { item: GroceryItem; amounts: Map<string, { amount: GroceryAmount; factor: number }> }
  >();
  for (const meal of meals) {
    if (!meal.included) continue;
    const scale = meal.plannedServings / meal.recipeServings;
    for (const ingredient of meal.ingredients) {
      const name = normalize(ingredient.name);
      let entry = items.get(name);
      if (!entry) {
        entry = { item: { name, amounts: [], meals: [] }, amounts: new Map() };
        items.set(name, entry);
      }
      if (!entry.item.meals.some(({ id }) => id === meal.id)) {
        entry.item.meals.push({ id: meal.id, title: meal.title });
      }
      const unit = resolveUnit(ingredient.unit);
      // Keep unmeasured requirements visible even when another recipe has an amount.
      const key = ingredient.quantity === null ? `unspecified:${unit.label}` : unit.family;
      const existing = entry.amounts.get(key);
      if (existing && ingredient.quantity !== null && existing.amount.quantity !== null) {
        existing.amount.quantity += (ingredient.quantity * scale * unit.factor) / existing.factor;
      } else if (!existing) {
        const amount = {
          quantity: ingredient.quantity === null ? null : ingredient.quantity * scale,
          unit: unit.label,
        };
        entry.item.amounts.push(amount);
        entry.amounts.set(key, { amount, factor: unit.factor });
      }
    }
  }
  return [...items.values()]
    .map(({ item }) => item)
    .sort((a, b) => a.name.localeCompare(b.name, "en"));
}

export function formatGroceryAmount({ quantity, unit }: GroceryAmount): string {
  if (quantity === null) return unit === "each" ? "as needed" : `as needed (${unit})`;
  const formatted = new Intl.NumberFormat(
    "en-US",
    quantity < 0.001 ? { maximumSignificantDigits: 3 } : { maximumFractionDigits: 3 },
  ).format(quantity);
  return `${formatted} ${unit}`;
}

export function groceryListText(items: readonly GroceryItem[]) {
  return [
    "My Plantry grocery list",
    ...items.map((item) => `${item.name}: ${item.amounts.map(formatGroceryAmount).join(" + ")}`),
  ].join("\n");
}
