"use client";

import {
  ArrowLeft,
  ArrowRight,
  Ban,
  Heart,
  Loader2,
  Salad,
  ThumbsDown,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import {
  FoodPreferencesFields,
  type FoodPreferencesSection,
} from "@/components/food-preferences-fields";
import { HouseholdSizeField } from "@/components/household-size-field";
import { Button } from "@/components/ui/button";
import type { FoodPreferences } from "@/lib/preferences";
import { cn } from "@/lib/utils";
import { completeOnboarding, type OnboardingFormState } from "./actions";

type Step = {
  field: "householdSize" | FoodPreferencesSection;
  icon: LucideIcon;
  tile: string;
  eyebrow: string;
  title: string;
  intro: string;
};

// One question per step, so each one fits on the screen without scrolling.
const STEPS: Step[] = [
  {
    field: "householdSize",
    icon: UsersRound,
    tile: "bg-sky-soft text-sky-ink",
    eyebrow: "Your household",
    title: "Who's at the table?",
    intro:
      "Count everyone who sits down to dinner on a typical night. We'll size recipes and groceries to match.",
  },
  {
    field: "dietaryRestrictions",
    icon: Salad,
    tile: "bg-plum-soft text-plum-ink",
    eyebrow: "Dietary needs",
    title: "Any dietary needs?",
    intro: "Pick any that apply to you. Every meal we suggest will follow them.",
  },
  {
    field: "cannotEat",
    icon: Ban,
    tile: "bg-tomato-soft text-tomato-ink",
    eyebrow: "Off the table",
    title: "Anything you can't eat?",
    intro: "Allergies and anything that's off limits. We'll never plan a meal with these.",
  },
  {
    field: "dislikes",
    icon: ThumbsDown,
    tile: "bg-saffron-soft text-saffron-ink",
    eyebrow: "Not your thing",
    title: "Anything you'd rather skip?",
    intro: "Not dangerous, just not for you. We'll steer dinners around these.",
  },
  {
    field: "likes",
    icon: Heart,
    tile: "bg-sage-soft text-sage-ink",
    eyebrow: "Favorites",
    title: "What do you love to eat?",
    intro: "Ingredients and dishes you're always happy to see on the table.",
  },
];

export function OnboardingForm({
  displayName,
  householdSize,
  preferences,
}: {
  displayName: string | null;
  householdSize: number;
  preferences: FoodPreferences;
}) {
  const [state, formAction, pending] = useActionState<OnboardingFormState, FormData>(
    completeOnboarding,
    {},
  );
  const [step, setStep] = useState(0);
  // Null until the user moves, so the first step keeps the page's own entrance.
  const [direction, setDirection] = useState<"forward" | "back" | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  // A new step starts at its heading, for keyboards and screen readers too.
  useEffect(() => {
    if (direction === null) return;
    window.scrollTo({ top: 0 });
    heading.current?.focus({ preventScroll: true });
  }, [step, direction]);

  const go = (next: number) => {
    setDirection(next > step ? "forward" : "back");
    setStep(next);
  };

  const { field, icon: Icon, tile, eyebrow, title, intro } = STEPS[step];
  const last = step === STEPS.length - 1;
  const entrance =
    direction === "forward"
      ? "animate-step-forward"
      : direction === "back"
        ? "animate-step-back"
        : undefined;
  // The answer follows its question in by a beat.
  const fieldEntrance = cn(entrance, "[animation-delay:70ms]");

  return (
    <form action={formAction} className="flex flex-1 flex-col">
      <div className="flex items-center gap-4">
        <p className="text-xs font-semibold tracking-widest text-sage-ink uppercase tabular-nums">
          Step {step + 1} of {STEPS.length}
        </p>
        <div aria-hidden className="flex flex-1 gap-1.5">
          {STEPS.map(({ field }, index) => (
            <span key={field} className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
              <span
                className={cn(
                  "block h-full origin-left rounded-full bg-primary transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                  index <= step ? "scale-x-100" : "scale-x-0",
                )}
              />
            </span>
          ))}
        </div>
      </div>

      <div key={step} className={cn("mt-6 sm:mt-10", entrance)}>
        <div className="flex items-center gap-3">
          <span aria-hidden className={cn("grid size-11 place-items-center rounded-2xl", tile)}>
            <Icon className="size-5" />
          </span>
          <p className="text-sm font-medium text-muted-foreground">
            {step === 0 && displayName ? `Welcome, ${displayName}` : eyebrow}
          </p>
        </div>
        <h1
          ref={heading}
          tabIndex={-1}
          className="mt-4 font-display text-4xl font-medium outline-none sm:text-5xl"
        >
          {title}
        </h1>
        <p className="mt-3 text-base text-muted-foreground sm:text-lg">{intro}</p>
      </div>

      {/* Every question stays mounted so all the answers are submitted together. */}
      <div className="mt-6 pb-6 sm:mt-8 sm:pb-10">
        <div hidden={field !== "householdSize"} className={fieldEntrance}>
          <HouseholdSizeField initial={householdSize} bare />
        </div>
        <div hidden={field === "householdSize"}>
          <FoodPreferencesFields
            initial={preferences}
            only={field === "householdSize" ? "dietaryRestrictions" : field}
            sectionClassName={fieldEntrance}
          />
        </div>
      </div>

      <div className="sticky bottom-0 -mx-6 mt-auto border-t bg-background/90 px-6 py-4 backdrop-blur-md">
        {state.error && (
          <p
            role="alert"
            className="mb-4 animate-fade-up rounded-2xl bg-tomato-soft px-4 py-3 text-sm text-tomato-ink"
          >
            {state.error}
          </p>
        )}
        {/* The keys keep React from reusing a button across steps: a button
            that turns into type="submit" mid-click would submit the form. */}
        <div className="flex items-center justify-between gap-4">
          {step === 0 ? (
            <Button
              key="skip"
              type="submit"
              name="intent"
              value="skip"
              variant="ghost"
              className="text-muted-foreground"
              disabled={pending}
            >
              Skip for now
            </Button>
          ) : (
            <Button
              key="back"
              type="button"
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => go(step - 1)}
              disabled={pending}
            >
              <ArrowLeft />
              Back
            </Button>
          )}
          <p className="hidden text-xs text-muted-foreground sm:block">
            You can change any of this later in Settings.
          </p>
          {last ? (
            <Button key="finish" type="submit" size="lg" disabled={pending}>
              {pending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  Start planning
                  <ArrowRight />
                </>
              )}
            </Button>
          ) : (
            <Button
              key="continue"
              type="button"
              size="lg"
              onClick={() => go(step + 1)}
              disabled={pending}
            >
              Continue
              <ArrowRight />
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
