"use client";

import { Check, Loader2 } from "lucide-react";
import { useActionState, useState } from "react";
import { HouseholdSizeField } from "@/components/household-size-field";
import { Button } from "@/components/ui/button";
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

      <div className="mt-10 flex flex-wrap items-center gap-4 border-t pt-6">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : "Save household"}
        </Button>
        {state.error && (
          <p
            role="alert"
            className="animate-fade-up rounded-2xl bg-tomato-soft px-4 py-3 text-sm text-tomato-ink"
          >
            {state.error}
          </p>
        )}
        {state.saved && !edited && !pending && (
          <p
            role="status"
            className="flex animate-fade-up items-center gap-1.5 text-sm font-medium text-sage-ink"
          >
            <Check className="size-4" />
            Saved. Your next plan will be sized for this.
          </p>
        )}
      </div>
    </form>
  );
}
