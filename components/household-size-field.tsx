"use client";

import { Minus, Plus, UserRound } from "lucide-react";
import { useState } from "react";
import { MAX_HOUSEHOLD_SIZE, MIN_HOUSEHOLD_SIZE } from "@/lib/household";
import { cn } from "@/lib/utils";

// One tile per person at the table, cycling through the food tones.
const PERSON_TONES = [
  "bg-sage-soft text-sage-ink",
  "bg-saffron-soft text-saffron-ink",
  "bg-tomato-soft text-tomato-ink",
  "bg-plum-soft text-plum-ink",
  "bg-sky-soft text-sky-ink",
];

// Bigger households get a "+3" tile after this many, so the row stays one line.
const MAX_PERSON_TILES = 6;

const SEATS = Array.from({ length: MAX_PERSON_TILES }, (_, index) => index);

const seat =
  "overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";
const seatShown = "w-10 scale-100 opacity-100 sm:w-12";
const seatHidden = "w-0 scale-50 opacity-0";
const tile = "grid size-9 place-items-center rounded-2xl sm:size-10";

const stepButton =
  "grid size-11 cursor-pointer place-items-center rounded-xl text-foreground transition-all outline-none hover:bg-secondary focus-visible:ring-4 focus-visible:ring-ring/20 active:scale-90 disabled:pointer-events-none disabled:opacity-30";

function summary(size: number) {
  if (size === 1) return "Cooking for one";
  if (size === 2) return "Dinner for two";
  return `A table of ${size}`;
}

/**
 * The household size question, used by onboarding and settings. Put it inside
 * a <form>; read the submission with `parseHouseholdSizeForm`.
 */
export function HouseholdSizeField({
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
  const [size, setSize] = useState(initial);
  // Which way the number last moved, so it rolls in from the right side.
  const [rising, setRising] = useState(true);

  const change = (next: number) => {
    onChange?.();
    setRising(next > size);
    setSize(next);
  };

  const extra = size - MAX_PERSON_TILES;

  return (
    <fieldset>
      <legend className={bare ? "sr-only" : "text-base font-semibold"}>
        How many people do you usually cook for?
      </legend>
      {!bare && (
        <p className="mt-0.5 mb-4 text-sm text-muted-foreground">
          Count everyone who sits down to dinner on a typical night, yourself included.
        </p>
      )}

      <div className="rounded-3xl border bg-card p-5 shadow-[0_1px_2px_rgba(28,41,32,0.04),0_8px_24px_-12px_rgba(28,41,32,0.08)] sm:p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
          <div className="inline-flex shrink-0 items-center self-start rounded-2xl border border-input p-1.5 shadow-xs">
            <button
              type="button"
              onClick={() => change(size - 1)}
              disabled={size <= MIN_HOUSEHOLD_SIZE}
              aria-label="One fewer person"
              className={stepButton}
            >
              <Minus className="size-4" strokeWidth={2.5} />
            </button>
            <output
              aria-live="polite"
              className="block w-20 overflow-hidden text-center font-display text-5xl leading-none font-medium tabular-nums"
            >
              <span
                key={size}
                className={cn("block py-1", rising ? "animate-tick-up" : "animate-tick-down")}
              >
                {size}
              </span>
              <span className="sr-only">{size === 1 ? " person" : " people"}</span>
            </output>
            <button
              type="button"
              onClick={() => change(size + 1)}
              disabled={size >= MAX_HOUSEHOLD_SIZE}
              aria-label="One more person"
              className={stepButton}
            >
              <Plus className="size-4" strokeWidth={2.5} />
            </button>
          </div>

          {/* Decorative: the number above already says it. Every seat stays
              mounted so tiles ease in and out instead of popping. */}
          <div aria-hidden className="flex min-h-10 items-center">
            {SEATS.map((index) => (
              <span key={index} className={cn(seat, index < size ? seatShown : seatHidden)}>
                <span className={cn(tile, PERSON_TONES[index % PERSON_TONES.length])}>
                  <UserRound className="size-5" />
                </span>
              </span>
            ))}
            <span className={cn(seat, extra > 0 ? seatShown : seatHidden)}>
              <span className={cn(tile, "bg-secondary text-sm font-semibold tabular-nums")}>
                {/* Holds its last number while easing out, instead of flashing "+0". */}
                <span
                  key={extra}
                  className={cn("block", rising ? "animate-tick-up" : "animate-tick-down")}
                >
                  +{Math.max(extra, 1)}
                </span>
              </span>
            </span>
          </div>
        </div>

        <p className="mt-5 border-t pt-4 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{summary(size)}.</span> Recipes and grocery
          amounts will be sized for {size} {size === 1 ? "serving" : "servings"}.
        </p>
      </div>

      <input type="hidden" name="householdSize" value={size} />
    </fieldset>
  );
}
