import { z } from "zod";
import { convertQuantity } from "@/lib/groceries";
import { UNITS, type Ingredient, type Unit } from "@/lib/meal-plan";
import { normalizeFood } from "@/lib/preferences";

export const PANTRY_STATES = [
  { value: "have", label: "Have" },
  { value: "low", label: "Running low" },
  { value: "out", label: "Out" },
  { value: "unsure", label: "Unsure" },
] as const;

export const pantryStateSchema = z.enum(["have", "low", "out", "unsure"]);

export type PantryState = z.infer<typeof pantryStateSchema>;

export type PantryDetails = {
  name: string;
  state: PantryState;
  quantity: number;
  unit: Unit;
  boughtOn: string | null;
  expiresOn: string | null;
  openedOn: string | null;
};

export type PantryItem = PantryDetails & { id: string };

/** A pantry amount the planner can spend. Soonest expiration sorts first. */
export type PantryStock = Pick<PantryDetails, "name" | "quantity" | "unit" | "expiresOn" | "state">;

/** Items that still have some amount, soonest to expire first. Undated items go last. */
export function pantryForPlanning(items: readonly PantryStock[]) {
  return items
    .filter((item) => (item.state === "have" || item.state === "low") && item.quantity > 0)
    .map((item) => ({ ...item, name: normalizeFood(item.name) }))
    .sort((a, b) => {
      if (a.expiresOn && b.expiresOn) return a.expiresOn.localeCompare(b.expiresOn);
      if (a.expiresOn) return -1;
      if (b.expiresOn) return 1;
      return a.name.localeCompare(b.name, "en");
    });
}

const roundQuantity = (quantity: number) => Math.round(quantity * 100) / 100;

/**
 * Walks meals in order and subtracts what each recipe uses. Later meals see
 * only what remains. Amounts convert within weight or volume, never between them.
 */
export function remainingPantry(
  stock: readonly PantryStock[],
  meals: readonly { ingredients: Pick<Ingredient, "name" | "quantity" | "unit">[] }[],
) {
  const left = stock.map((item) => ({ ...item, name: normalizeFood(item.name) }));
  for (const meal of meals) {
    for (const ingredient of meal.ingredients) {
      const item = left.find((entry) => entry.name === normalizeFood(ingredient.name));
      if (!item || item.quantity <= 0) continue;
      const used = convertQuantity(ingredient.quantity, ingredient.unit, item.unit);
      if (used == null) continue;
      item.quantity = roundQuantity(Math.max(0, item.quantity - used));
    }
  }
  return left;
}

const DATE_ORDER = "Check the bought, opened, and expiration dates.";

/** A real calendar day, not a rolled-over date like February 31. */
export function isIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

const optionalDate = z
  .string()
  .trim()
  .refine((value) => value === "" || isIsoDate(value), "Enter a real date.")
  .transform((value) => (value === "" ? null : value));

export const pantryFormSchema = z
  .object({
    name: z
      .string()
      .transform(normalizeFood)
      .refine((name) => name.length > 0, "Enter an ingredient."),
    quantity: z.coerce
      .number("Enter how much you have.")
      .positive("Enter how much you have.")
      .max(9999, "Enter an amount up to 9,999."),
    unit: z.enum(UNITS),
    state: pantryStateSchema,
    boughtOn: optionalDate,
    expiresOn: optionalDate,
    openedOn: optionalDate,
  })
  .superRefine((item, ctx) => {
    const outOfOrder =
      (item.boughtOn && item.openedOn && item.openedOn < item.boughtOn) ||
      (item.boughtOn && item.expiresOn && item.expiresOn < item.boughtOn) ||
      (item.openedOn && item.expiresOn && item.expiresOn < item.openedOn);
    if (!outOfOrder) return;
    ctx.addIssue({ code: "custom", message: DATE_ORDER });
  });

export type PantryForm = z.infer<typeof pantryFormSchema>;

/** Reads the add and edit forms. Dates may be blank. */
export function parsePantryForm(formData: FormData) {
  return pantryFormSchema.safeParse({
    name: formData.get("name"),
    quantity: formData.get("quantity"),
    unit: formData.get("unit"),
    state: formData.get("state") || "have",
    boughtOn: formData.get("boughtOn") ?? "",
    expiresOn: formData.get("expiresOn") ?? "",
    openedOn: formData.get("openedOn") ?? "",
  });
}

/** Keeps pantry names in the same normalized form as other food inputs. */
export function pantryNameSet(names: Iterable<string>) {
  const foods = new Set<string>();
  for (const name of names) {
    const normalized = normalizeFood(name);
    if (normalized) foods.add(normalized);
  }
  return foods;
}

/** Foods the user definitely has on hand right now. */
export function availablePantryNames(items: Iterable<Pick<PantryItem, "name" | "state">>) {
  return [
    ...pantryNameSet([...items].filter((item) => item.state === "have").map((item) => item.name)),
  ];
}

/** Exact normalized match only; broader pantry substitution comes later. */
export function isPantryAvailable(name: string, availableNames: ReadonlySet<string>) {
  return availableNames.has(normalizeFood(name));
}

/** "Nov 2, 2026" for a stored calendar date, without shifting it by time zone. */
export function formatPantryDate(isoDate: string) {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
