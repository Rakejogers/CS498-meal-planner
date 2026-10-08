"use client";

import { Check, Loader2 } from "lucide-react";
import { useActionState, useState } from "react";
import { FoodPreferencesFields } from "@/components/food-preferences-fields";
import { Button } from "@/components/ui/button";
import type { FoodPreferences } from "@/lib/preferences";
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

      <div className="mt-10 flex flex-wrap items-center gap-4 border-t pt-6">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : "Save preferences"}
        </Button>
        {state.error && (
          <p role="alert" className="rounded-2xl bg-tomato-soft px-4 py-3 text-sm text-tomato-ink">
            {state.error}
          </p>
        )}
        {state.saved && !edited && !pending && (
          <p role="status" className="flex items-center gap-1.5 text-sm font-medium text-sage-ink">
            <Check className="size-4" />
            Saved. Your next plan will follow these.
          </p>
        )}
      </div>
    </form>
  );
}
