import { z } from "zod";

// Household settings: how many people the user cooks for (their default
// serving count) and how many dinners they want each week. Shared by the forms
// and the server actions so both sides agree on what's valid. The ranges match
// the database checks.

export const MIN_HOUSEHOLD_SIZE = 1;
export const MAX_HOUSEHOLD_SIZE = 12;
export const DEFAULT_HOUSEHOLD_SIZE = 2;

export const MIN_MEALS_PER_WEEK = 1;
export const MAX_MEALS_PER_WEEK = 7;
export const DEFAULT_MEALS_PER_WEEK = 4;

const OUT_OF_RANGE = `Pick a household size between ${MIN_HOUSEHOLD_SIZE} and ${MAX_HOUSEHOLD_SIZE}.`;
const MEALS_OUT_OF_RANGE = `Pick between ${MIN_MEALS_PER_WEEK} and ${MAX_MEALS_PER_WEEK} dinners a week.`;

export const householdSizeSchema = z.coerce
  .number(OUT_OF_RANGE)
  .int(OUT_OF_RANGE)
  .min(MIN_HOUSEHOLD_SIZE, OUT_OF_RANGE)
  .max(MAX_HOUSEHOLD_SIZE, OUT_OF_RANGE);

export const mealsPerWeekSchema = z.coerce
  .number(MEALS_OUT_OF_RANGE)
  .int(MEALS_OUT_OF_RANGE)
  .min(MIN_MEALS_PER_WEEK, MEALS_OUT_OF_RANGE)
  .max(MAX_MEALS_PER_WEEK, MEALS_OUT_OF_RANGE);

const householdSchema = z.object({
  householdSize: householdSizeSchema,
  mealsPerWeek: mealsPerWeekSchema,
});

export type Household = z.infer<typeof householdSchema>;

/** Reads what `HouseholdSizeField` and `MealsPerWeekField` submitted. */
export function parseHouseholdForm(formData: FormData) {
  return householdSchema.safeParse({
    householdSize: formData.get("householdSize"),
    mealsPerWeek: formData.get("mealsPerWeek"),
  });
}
