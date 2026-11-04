"use client";

import { useState } from "react";
import { MAX_MEALS_PER_WEEK, MIN_MEALS_PER_WEEK } from "@/lib/household";
import { cn } from "@/lib/utils";

const CHOICES = Array.from(
  { length: MAX_MEALS_PER_WEEK - MIN_MEALS_PER_WEEK + 1 },
  (_, index) => MIN_MEALS_PER_WEEK + index,
);

function summary(count: number) {
  if (count === 1) return "One dinner a week";
  if (count === MAX_MEALS_PER_WEEK) return "Dinner every night";
  return `${count} dinners a week`;
}

/**
 * How many dinners to plan each week, used by onboarding and settings. Put it
 * inside a <form>; read the submission with `parseHouseholdForm`.
 */
export function MealsPerWeekField({
  initial,
  onChange,
  bare = false,
}: {
  initial: number;
  /** Called whenever the user changes the answer. */
  onChange?: () => void;
  /** Hides the question, for a page whose own heading already asks it. */
  bare?: boolean;
}) {
  const [count, setCount] = useState(initial);

  return (
    <fieldset>
      <legend className={bare ? "sr-only" : "text-base font-semibold"}>
        How many dinners should we plan each week?
      </legend>
      {!bare && (
        <p className="mt-0.5 mb-4 text-sm text-muted-foreground">
          Leave room for leftovers and nights out.
        </p>
      )}

      <div className="rounded-3xl border bg-card p-5 shadow-[0_1px_2px_rgba(28,41,32,0.04),0_8px_24px_-12px_rgba(28,41,32,0.08)] sm:p-6">
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
          {CHOICES.map((choice) => (
            <label key={choice} className="group relative">
              <span
                className={cn(
                  "grid h-14 place-items-center rounded-2xl border font-display text-2xl font-medium tabular-nums transition-all duration-200 sm:h-16 sm:text-3xl",
                  "group-active:scale-95 group-has-[:focus-visible]:ring-4 group-has-[:focus-visible]:ring-ring/20 motion-reduce:transition-none",
                  // Every night up to the choice fills in, so the week reads at a glance.
                  choice < count && "border-transparent bg-sage-soft text-sage-ink",
                  choice === count && "border-transparent bg-primary text-primary-foreground",
                  choice > count && "border-input text-muted-foreground group-hover:bg-secondary",
                )}
              >
                {choice}
              </span>
              <span className="sr-only">{choice === 1 ? " dinner" : " dinners"}</span>
              {/* Invisible and over the tile, so the tile is what gets clicked. It
                  comes last so it sits on top without needing a z-index. */}
              <input
                type="radio"
                name="mealsPerWeek"
                value={choice}
                checked={count === choice}
                onChange={() => {
                  onChange?.();
                  setCount(choice);
                }}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </label>
          ))}
        </div>

        <p className="mt-5 border-t pt-4 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{summary(count)}.</span> Each plan will have{" "}
          {count} {count === 1 ? "dinner" : "dinners"}, and your grocery list covers them all.
        </p>
      </div>
    </fieldset>
  );
}
