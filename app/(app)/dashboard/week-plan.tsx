"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import type { MealPlan } from "@/lib/data";
import { formatWeekOf } from "@/lib/meal-plan";
import { generatePlan, type PlanFormState } from "./actions";
import { Dinners, DinnerSkeletons } from "./dinner-cards";

/**
 * The week's dinners and the button that plans them. While a plan is being
 * made, placeholder cards stand in for the dinners on their way.
 */
export function WeekPlan({ plan, mealsPerWeek }: { plan: MealPlan | null; mealsPerWeek: number }) {
  const [state, formAction, pending] = useActionState<PlanFormState>(generatePlan, {});

  const planButton = (
    <form action={formAction}>
      <Button
        type="submit"
        size={plan ? "default" : "lg"}
        variant={plan ? "outline" : "default"}
        disabled={pending}
      >
        {pending ? (
          <>
            <Loader2 className="animate-spin" />
            Picking dinners…
          </>
        ) : plan ? (
          "Plan more dinners"
        ) : (
          "Plan my week"
        )}
      </Button>
    </form>
  );

  return (
    <div aria-busy={pending}>
      {plan ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <p className="text-lg text-muted-foreground">
            Your dinners for the week of {formatWeekOf(plan.weekStart)}.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/groceries" className={buttonVariants()}>
              Grocery list <ArrowRight aria-hidden="true" />
            </Link>
            {planButton}
          </div>
        </div>
      ) : (
        <>
          <p className="mt-3 text-lg text-muted-foreground">
            We&apos;ll pick {mealsPerWeek} {mealsPerWeek === 1 ? "dinner" : "dinners"} around what
            you like and how many you&apos;re cooking for.
          </p>
          <div className="mt-8">{planButton}</div>
        </>
      )}

      {state.error && !pending && (
        <p
          role="alert"
          className="mt-6 animate-fade-up rounded-2xl bg-tomato-soft px-4 py-3 text-sm text-tomato-ink"
        >
          {state.error}
        </p>
      )}

      {pending ? (
        <>
          <PlanningMessage />
          <DinnerSkeletons count={mealsPerWeek} />
        </>
      ) : (
        plan && <Dinners meals={plan.meals} />
      )}
    </div>
  );
}

const PLANNING_MESSAGES = [
  "Picking dinners you'll like…",
  "Steering clear of what you can't eat…",
  "Balancing the week…",
  "Writing up the recipes…",
];

/** A line that changes every few seconds while a plan is being made. */
function PlanningMessage() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(
      () => setIndex((current) => Math.min(current + 1, PLANNING_MESSAGES.length - 1)),
      2800,
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <p role="status" className="mt-8 flex items-center gap-2.5 text-sm text-muted-foreground">
      <span className="relative flex size-2.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-sage opacity-60" />
        <span className="relative inline-flex size-2.5 rounded-full bg-sage" />
      </span>
      <span key={index} className="animate-fade-up">
        {PLANNING_MESSAGES[index]}
      </span>
    </p>
  );
}
