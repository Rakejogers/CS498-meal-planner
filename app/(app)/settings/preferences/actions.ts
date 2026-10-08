"use server";

import { revalidatePath } from "next/cache";
import { saveFoodPreferences } from "@/lib/data";
import { parseFoodPreferencesForm } from "@/lib/preferences";

export type PreferencesFormState = {
  error?: string;
  saved?: boolean;
};

export async function savePreferences(
  _prev: PreferencesFormState,
  formData: FormData,
): Promise<PreferencesFormState> {
  const parsed = parseFoodPreferencesForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { ok } = await saveFoodPreferences(parsed.data);
  if (!ok) return { error: "We couldn't save your preferences. Please try again." };

  revalidatePath("/settings/preferences");
  return { saved: true };
}
