"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { generatePlan, type PlanFormState } from "./actions";

/** Plans the week, or swaps in different dinners when `hasPlan` is set. */
export function PlanWeekButton({ hasPlan }: { hasPlan: boolean }) {
  const [state, formAction, pending] = useActionState<PlanFormState>(generatePlan, {});

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <Button
        type="submit"
        size={hasPlan ? "default" : "lg"}
        variant={hasPlan ? "outline" : "default"}
        disabled={pending}
      >
        {pending ? (
          <>
            <Loader2 className="animate-spin" />
            Picking dinners…
          </>
        ) : hasPlan ? (
          "Plan more dinners"
        ) : (
          "Plan my week"
        )}
      </Button>
      {state.error && (
        <p
          role="alert"
          className="animate-fade-up rounded-2xl bg-tomato-soft px-4 py-3 text-sm text-tomato-ink"
        >
          {state.error}
        </p>
      )}
    </form>
  );
}
