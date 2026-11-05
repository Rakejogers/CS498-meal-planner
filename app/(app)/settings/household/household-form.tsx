"use client";

import { useActionState, useState } from "react";
import { HouseholdSizeField } from "@/components/household-size-field";
import { MealsPerWeekField } from "@/components/meals-per-week-field";
import type { Household } from "@/lib/household";
import { SaveBar } from "../save-bar";
import { saveHousehold, type HouseholdFormState } from "./actions";

export function HouseholdForm({ initial }: { initial: Household }) {
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
      <div className="space-y-10">
        <HouseholdSizeField initial={initial.householdSize} onChange={() => setEdited(true)} />
        <MealsPerWeekField initial={initial.mealsPerWeek} onChange={() => setEdited(true)} />
      </div>

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
