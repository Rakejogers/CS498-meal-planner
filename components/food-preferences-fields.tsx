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

/**
 * The food preference questions, used by onboarding and settings. Put it
 * inside a <form>; read the submission with `parseFoodPreferencesForm`.
 */
export function FoodPreferencesFields({
  initial,
  onChange,
}: {
  initial: FoodPreferences;
  /** Called whenever the user changes an answer. */
  onChange?: () => void;
}) {
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
      <fieldset>
        <legend className="text-base font-semibold">Dietary needs</legend>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Pick any that apply to you. Every meal we suggest will follow them.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {DIETARY_RESTRICTIONS.map(({ value, label }) => {
            const selected = restrictions.includes(value);
            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleRestriction(value)}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all outline-none focus-visible:ring-4 focus-visible:ring-ring/20 active:scale-[0.97]",
                  selected
                    ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "bg-card hover:border-foreground/20 hover:bg-secondary/60",
                )}
              >
                {selected && <Check className="size-3.5" strokeWidth={3} />}
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
        <div key={key}>
          <Label htmlFor={key} className="text-base font-semibold">
            {label}
          </Label>
          <p className="mt-0.5 mb-4 text-sm text-muted-foreground">{hint}</p>
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
      ))}
    </div>
  );
}
