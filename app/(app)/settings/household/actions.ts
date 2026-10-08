"use server";

import { revalidatePath } from "next/cache";
import { saveHouseholdSize } from "@/lib/data";
import { parseHouseholdSizeForm } from "@/lib/household";

export type HouseholdFormState = {
  error?: string;
  saved?: boolean;
};

export async function saveHousehold(
  _prev: HouseholdFormState,
  formData: FormData,
): Promise<HouseholdFormState> {
  const parsed = parseHouseholdSizeForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { ok } = await saveHouseholdSize(parsed.data);
  if (!ok) return { error: "We couldn't save your household. Please try again." };

  revalidatePath("/settings/household");
  return { saved: true };
}
