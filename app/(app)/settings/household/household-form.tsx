"use client";

import { useActionState, useState } from "react";
import { CookingDaysField } from "@/components/cooking-days-field";
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
  const [mealsPerWeek, setMealsPerWeek] = useState(initial.mealsPerWeek);
  const [cookingDays, setCookingDays] = useState(
    Math.min(initial.cookingDays, initial.mealsPerWeek),
  );

  return (
    <form
      action={(formData) => {
        setEdited(false);
        formAction(formData);
      }}
    >
      <div className="space-y-10">
        <HouseholdSizeField initial={initial.householdSize} onChange={() => setEdited(true)} />
        <MealsPerWeekField
          initial={initial.mealsPerWeek}
          onChange={(count) => {
            setEdited(true);
            setMealsPerWeek(count);
            setCookingDays((days) => Math.min(days, count));
          }}
        />
        <CookingDaysField
          count={cookingDays}
          max={mealsPerWeek}
          onChange={(days) => {
            setEdited(true);
            setCookingDays(days);
          }}
        />
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
