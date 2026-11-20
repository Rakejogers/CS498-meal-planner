"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { swapMeal, type PlanFormState } from "./actions";

export function SwapMealButton({ mealId, mealTitle }: { mealId: string; mealTitle: string }) {
  const [state, formAction, pending] = useActionState<PlanFormState, FormData>(swapMeal, {});

  return (
    <div className="flex flex-col items-end gap-2">
      <form action={formAction}>
        <input type="hidden" name="mealId" value={mealId} />
        <Button
          type="submit"
          variant="outline"
          size="sm"
          disabled={pending}
          className="relative z-10"
          aria-label={`Swap ${mealTitle}`}
        >
          {pending ? <Loader2 className="animate-spin" /> : <RefreshCw aria-hidden="true" />}
          {pending ? "Finding a new dinner…" : "Swap dinner"}
        </Button>
      </form>
      {state.error && !pending && (
        <p role="alert" className="max-w-56 text-right text-sm text-tomato-ink">
          {state.error}
        </p>
      )}
    </div>
  );
}
