"use client";

import { cn } from "@/lib/utils";

function summary(days: number, meals: number) {
  if (days >= meals) return "You'll cook every dinner.";
  const mealLabel = days === 1 ? "1 meal" : `${days} meals`;
  return `Your week will list ${mealLabel}, with enough food for all ${meals} dinners.`;
}

/**
 * How many days to actually cook, used beside dinners per week. Put it inside
 * a <form>; read the submission with `parseHouseholdForm`.
 */
export function CookingDaysField({
  count,
  max,
  onChange,
}: {
  count: number;
  /** Can't cook more days than there are dinners. */
  max: number;
  onChange?: (days: number) => void;
}) {
  const days = Math.min(count, max);
  const choices = Array.from({ length: max }, (_, index) => index + 1);

  return (
    <fieldset>
      <legend className="text-base font-semibold">How many days do you want to cook?</legend>
      <p className="mt-0.5 mb-4 text-sm text-muted-foreground">
        Cook once and eat the leftovers on the other nights.
      </p>

      <div className="rounded-3xl border bg-card p-5 shadow-[0_1px_2px_rgba(28,41,32,0.04),0_8px_24px_-12px_rgba(28,41,32,0.08)] sm:p-6">
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
          {choices.map((choice) => (
            <label key={choice} className="group relative">
              <span
                className={cn(
                  "grid h-14 place-items-center rounded-2xl border font-display text-2xl font-medium tabular-nums transition-all duration-200 sm:h-16 sm:text-3xl",
                  "group-active:scale-95 group-has-[:focus-visible]:ring-4 group-has-[:focus-visible]:ring-ring/20 motion-reduce:transition-none",
                  choice < days && "border-transparent bg-plum-soft text-plum-ink",
                  choice === days && "border-transparent bg-primary text-primary-foreground",
                  choice > days && "border-input text-muted-foreground group-hover:bg-secondary",
                )}
              >
                {choice}
              </span>
              <span className="sr-only">{choice === 1 ? " cooking day" : " cooking days"}</span>
              <input
                type="radio"
                name="cookingDays"
                value={choice}
                checked={days === choice}
                onChange={() => onChange?.(choice)}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </label>
          ))}
        </div>

        <p className="mt-5 border-t pt-4 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{summary(days, max)}</span>
        </p>
      </div>
    </fieldset>
  );
}
