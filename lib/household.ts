import { z } from "zod";

// Household size: how many people the user normally cooks for, which is also
// their default serving count. Shared by the form and the server actions so
// both sides agree on what's valid. The range matches the database check.

export const MIN_HOUSEHOLD_SIZE = 1;
export const MAX_HOUSEHOLD_SIZE = 12;
export const DEFAULT_HOUSEHOLD_SIZE = 2;

const OUT_OF_RANGE = `Pick a household size between ${MIN_HOUSEHOLD_SIZE} and ${MAX_HOUSEHOLD_SIZE}.`;

export const householdSizeSchema = z.coerce
  .number(OUT_OF_RANGE)
  .int(OUT_OF_RANGE)
  .min(MIN_HOUSEHOLD_SIZE, OUT_OF_RANGE)
  .max(MAX_HOUSEHOLD_SIZE, OUT_OF_RANGE);

/** Reads what `HouseholdSizeField` submitted. */
export function parseHouseholdSizeForm(formData: FormData) {
  return householdSizeSchema.safeParse(formData.get("householdSize"));
}
