"use server";

import { redirect } from "next/navigation";
import { APP_HOME } from "@/lib/auth";
import { requireUser, saveFoodPreferences, saveHouseholdSize } from "@/lib/data";
import { parseHouseholdSizeForm } from "@/lib/household";
import { parseFoodPreferencesForm } from "@/lib/preferences";
import { createClient } from "@/lib/supabase/server";

export type OnboardingFormState = {
  error?: string;
};

const SAVE_FAILED = "We couldn't save your answers. Please try again.";

/** Marks first-time setup as done, so the app stops sending the user here. */
async function markOnboarded() {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ onboarded_at: new Date().toISOString() })
    .eq("id", user.sub);
  if (error) console.error("markOnboarded failed:", error.message);

  return { ok: !error };
}

export async function completeOnboarding(
  _prev: OnboardingFormState,
  formData: FormData,
): Promise<OnboardingFormState> {
  // "Skip for now" finishes setup without saving any answers.
  if (formData.get("intent") !== "skip") {
    const householdSize = parseHouseholdSizeForm(formData);
    if (!householdSize.success) return { error: householdSize.error.issues[0].message };
    const preferences = parseFoodPreferencesForm(formData);
    if (!preferences.success) return { error: preferences.error.issues[0].message };

    // Answers first: a retry after a partial failure just saves them again.
    if (!(await saveHouseholdSize(householdSize.data)).ok) return { error: SAVE_FAILED };
    if (!(await saveFoodPreferences(preferences.data)).ok) return { error: SAVE_FAILED };
  }
  if (!(await markOnboarded()).ok) return { error: SAVE_FAILED };

  redirect(APP_HOME);
}
