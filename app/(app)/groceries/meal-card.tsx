"use client";

import { Check, CookingPot, Trash2 } from "lucide-react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { GroceryMeal } from "@/lib/groceries";
import { changeMealInclusion, removeMeal } from "./actions";
import { MealForm } from "./meal-form";

export function MealCard({ meal, householdSize }: { meal: GroceryMeal; householdSize: number }) {
  const [includeState, includeAction, including] = useActionState(changeMealInclusion, {});
  const [removeState, removeAction, removing] = useActionState(removeMeal, {});
  return (
    <Card className="p-5" aria-label={meal.title}>
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-saffron-soft text-saffron-ink">
          <CookingPot className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-xl font-medium wrap-break-word">{meal.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Cooking for {meal.plannedServings} · {meal.ingredients.length}{" "}
            {meal.ingredients.length === 1 ? "ingredient" : "ingredients"}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <form action={includeAction}>
          <input type="hidden" name="id" value={meal.id} />
          <input type="hidden" name="included" value={String(!meal.included)} />
          <Button
            type="submit"
            variant={meal.included ? "secondary" : "outline"}
            size="sm"
            disabled={including || removing}
            aria-pressed={meal.included}
          >
            {meal.included && <Check aria-hidden="true" />}
            {including ? "Updating…" : meal.included ? "Included in list" : "Include in list"}
          </Button>
        </form>
        <form action={removeAction}>
          <input type="hidden" name="id" value={meal.id} />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            aria-label={`Remove ${meal.title}`}
            disabled={including || removing}
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        </form>
      </div>
      {(includeState.error || removeState.error) && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {includeState.error || removeState.error}
        </p>
      )}
      <details className="mt-3 border-t pt-3">
        <summary className="cursor-pointer rounded text-sm font-medium text-primary outline-none focus-visible:ring-4 focus-visible:ring-ring/20">
          Edit meal &amp; ingredients
        </summary>
        <div className="mt-5">
          <MealForm householdSize={householdSize} meal={meal} />
        </div>
      </details>
    </Card>
  );
}
