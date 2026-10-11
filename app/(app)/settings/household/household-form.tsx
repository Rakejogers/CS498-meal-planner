"use client";

import { useActionState, useState } from "react";
import { HouseholdSizeField } from "@/components/household-size-field";
import { SaveBar } from "../save-bar";
import { saveHousehold, type HouseholdFormState } from "./actions";

export function HouseholdForm({ initial }: { initial: number }) {
  const [state, formAction, pending] = useActionState<HouseholdFormState, FormData>(
    saveHousehold,
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
      <HouseholdSizeField initial={initial} onChange={() => setEdited(true)} />

      <SaveBar
        label="Save household"
        savedMessage="Saved. Your next plan will be sized for this."
        pending={pending}
        edited={edited}
        saved={state.saved}
        error={state.error}
      />
    </form>
  );
}
