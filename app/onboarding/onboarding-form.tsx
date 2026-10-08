"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useActionState } from "react";
import { FoodPreferencesFields } from "@/components/food-preferences-fields";
import { Button } from "@/components/ui/button";
import type { FoodPreferences } from "@/lib/preferences";
import { completeOnboarding, type OnboardingFormState } from "./actions";

export function OnboardingForm({ initial }: { initial: FoodPreferences }) {
  const [state, formAction, pending] = useActionState<OnboardingFormState, FormData>(
    completeOnboarding,
    {},
  );

  return (
    <form action={formAction} className="mt-10">
      <FoodPreferencesFields initial={initial} />

      <div className="sticky bottom-0 -mx-6 mt-10 border-t bg-background/90 px-6 py-4 backdrop-blur-md">
        {state.error && (
          <p
            role="alert"
            className="mb-4 rounded-2xl bg-tomato-soft px-4 py-3 text-sm text-tomato-ink"
          >
            {state.error}
          </p>
        )}
        <div className="flex items-center justify-between gap-4">
          <Button
            type="submit"
            name="intent"
            value="skip"
            variant="ghost"
            className="text-muted-foreground"
            disabled={pending}
          >
            Skip for now
          </Button>
          <Button type="submit" size="lg" disabled={pending}>
            {pending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                Start planning
                <ArrowRight />
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
