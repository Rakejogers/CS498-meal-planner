"use client";

import { useActionState, useState } from "react";
import { FoodPreferencesFields } from "@/components/food-preferences-fields";
import type { FoodPreferences } from "@/lib/preferences";
import { SaveBar } from "../save-bar";
import { savePreferences, type PreferencesFormState } from "./actions";

export function PreferencesForm({ initial }: { initial: FoodPreferences }) {
  const [state, formAction, pending] = useActionState<PreferencesFormState, FormData>(
    savePreferences,
    {},
  );
  // True once something changed since the last save, so "Saved" doesn't linger.
  const [edited, setEdited] = useState(false);

  return (
    <form
      action={(formData) => {
        setEdited(false);
        formAction(formData);
      }}
    >
      <FoodPreferencesFields initial={initial} onChange={() => setEdited(true)} />

      <SaveBar
        label="Save preferences"
        savedMessage="Saved. Your next plan will follow these."
        pending={pending}
        edited={edited}
        saved={state.saved}
        error={state.error}
      />
    </form>
  );
}
