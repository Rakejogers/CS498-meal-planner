"use server";

import { revalidatePath } from "next/cache";
import { saveHousehold as saveHouseholdSettings } from "@/lib/data";
import { parseHouseholdForm } from "@/lib/household";

export type HouseholdFormState = {
  error?: string;
  saved?: boolean;
};

export async function saveHousehold(
  _prev: HouseholdFormState,
  formData: FormData,
): Promise<HouseholdFormState> {
  const parsed = parseHouseholdForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { ok } = await saveHouseholdSettings(parsed.data);
  if (!ok) return { error: "We couldn't save your household. Please try again." };

  revalidatePath("/settings/household");
  return { saved: true };
}
