"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { TagInput } from "@/components/tag-input";
import { Label } from "@/components/ui/label";
import {
  CANNOT_EAT_SUGGESTIONS,
  DIETARY_RESTRICTIONS,
  DISLIKE_SUGGESTIONS,
  LIKE_SUGGESTIONS,
  type DietaryRestriction,
  type FoodPreferences,
} from "@/lib/preferences";
import { cn } from "@/lib/utils";

type FoodList = "cannotEat" | "dislikes" | "likes";

/** One question in `FoodPreferencesFields`. */
export type FoodPreferencesSection = "dietaryRestrictions" | FoodList;

const FOOD_LISTS = [
  {
    key: "cannotEat",
    label: "Foods you can't eat",
    hint: "Allergies and anything that's off the table. We'll never plan a meal with these.",
    placeholder: "Peanuts, shellfish…",
    suggestions: CANNOT_EAT_SUGGESTIONS,
    tone: "tomato",
  },
  {
    key: "dislikes",
    label: "Foods you'd rather skip",
    hint: "Not dangerous, just not your thing.",
    placeholder: "Mushrooms, olives…",
    suggestions: DISLIKE_SUGGESTIONS,
    tone: "saffron",
  },
  {
    key: "likes",
    label: "Foods you love",
    hint: "Ingredients and dishes you're always happy to see on the table.",
    placeholder: "Pasta, salmon…",
    suggestions: LIKE_SUGGESTIONS,
    tone: "sage",
  },
] as const;

// On a single-page form each question's control sits in a card, like the household size field.
const CARD =
  "rounded-3xl border bg-card p-5 shadow-[0_1px_2px_rgba(28,41,32,0.04),0_8px_24px_-12px_rgba(28,41,32,0.08)] sm:p-6";

/**
 * The food preference questions, used by onboarding and settings. Put it
 * inside a <form>; read the submission with `parseFoodPreferencesForm`.
 *
 * Pass `only` to show one question at a time (a step-by-step flow). The rest
 * stay mounted and are still submitted, and each question's own heading is
 * hidden because the step around it already asks.
 */
export function FoodPreferencesFields({
  initial,
  onChange,
  only,
  sectionClassName,
}: {
  initial: FoodPreferences;
  /** Called whenever the user changes an answer. */
  onChange?: () => void;
  only?: FoodPreferencesSection;
  /** Added to each question, e.g. an entrance animation. */
  sectionClassName?: string;
}) {
  const stepped = only !== undefined;
  const [restrictions, setRestrictions] = useState(initial.dietaryRestrictions);
  const [foods, setFoods] = useState<Record<FoodList, string[]>>({
    cannotEat: initial.cannotEat,
    dislikes: initial.dislikes,
    likes: initial.likes,
  });

  const toggleRestriction = (value: DietaryRestriction) => {
    onChange?.();
    setRestrictions((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  };

  // A food lives in one list at a time: adding it to one takes it out of the others.
  const addFood = (list: FoodList, food: string) => {
    onChange?.();
    setFoods((current) => ({
      cannotEat: current.cannotEat.filter((item) => item !== food),
      dislikes: current.dislikes.filter((item) => item !== food),
      likes: current.likes.filter((item) => item !== food),
      [list]: [...current[list].filter((item) => item !== food), food],
    }));
  };

  const removeFood = (list: FoodList, food: string) => {
    onChange?.();
    setFoods((current) => ({ ...current, [list]: current[list].filter((item) => item !== food) }));
  };

  return (
    <div className="space-y-10">
      <fieldset hidden={stepped && only !== "dietaryRestrictions"} className={sectionClassName}>
        <legend className={stepped ? "sr-only" : "text-base font-semibold"}>Dietary needs</legend>
        {!stepped && (
          <p className="mt-0.5 mb-4 text-sm text-muted-foreground">
            Pick any that apply to you. Every meal we suggest will follow them.
          </p>
        )}
        <div className={cn("flex flex-wrap", stepped ? "gap-2.5" : cn(CARD, "gap-2"))}>
          {DIETARY_RESTRICTIONS.map(({ value, label }) => {
            const selected = restrictions.includes(value);
            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleRestriction(value)}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-full border font-medium transition-all outline-none focus-visible:ring-4 focus-visible:ring-ring/20 active:scale-[0.97]",
                  stepped ? "px-5 py-2.5 text-[15px]" : "px-4 py-2 text-sm",
                  selected
                    ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "bg-card hover:border-foreground/20 hover:bg-secondary/60",
                )}
              >
                {selected && <Check className="size-3.5 animate-pop-in" strokeWidth={3} />}
                {label}
              </button>
            );
          })}
        </div>
        {restrictions.map((value) => (
          <input key={value} type="hidden" name="dietaryRestrictions" value={value} />
        ))}
      </fieldset>

      {FOOD_LISTS.map(({ key, label, hint, placeholder, suggestions, tone }) => (
        <div key={key} hidden={stepped && only !== key} className={sectionClassName}>
          <Label htmlFor={key} className={stepped ? "sr-only" : "text-base font-semibold"}>
            {label}
          </Label>
          {!stepped && <p className="mt-0.5 mb-4 text-sm text-muted-foreground">{hint}</p>}
          <div className={stepped ? undefined : CARD}>
            <TagInput
              id={key}
              name={key}
              values={foods[key]}
              onAdd={(food) => addFood(key, food)}
              onRemove={(food) => removeFood(key, food)}
              suggestions={suggestions}
              placeholder={placeholder}
              tone={tone}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
