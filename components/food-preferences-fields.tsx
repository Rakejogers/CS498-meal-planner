"use client";

import {
  BadgeCheck,
  Bean,
  BeanOff,
  BeefOff,
  CandyOff,
  Carrot,
  Check,
  Croissant,
  Drumstick,
  Dumbbell,
  EggOff,
  Fish,
  FishSymbol,
  Flame,
  Flower2,
  Grape,
  HandHeart,
  HeartPulse,
  MilkOff,
  MoonStar,
  NutOff,
  Salad,
  ShrimpOff,
  Vegan,
  WheatOff,
  type LucideIcon,
} from "lucide-react";
import { useId, useState } from "react";
import { TagInput } from "@/components/tag-input";
import { Label } from "@/components/ui/label";
import {
  CANNOT_EAT_SUGGESTIONS,
  DIETARY_RESTRICTIONS,
  DISLIKE_SUGGESTIONS,
  LIKE_SUGGESTIONS,
  type DietaryRestriction,
  type DietGroup,
  type FoodPreferences,
} from "@/lib/preferences";
import { cn } from "@/lib/utils";

type FoodList = "cannotEat" | "dislikes" | "likes";

type DietSection = "eatingStyle" | "dietaryNeeds";

/** One question in `FoodPreferencesFields`. */
export type FoodPreferencesSection = DietSection | FoodList;

// The diet options are split across two questions so each fits on one screen.
const DIET_SECTIONS: {
  key: DietSection;
  label: string;
  hint: string;
  groups: DietGroup[];
}[] = [
  {
    key: "eatingStyle",
    label: "How you eat",
    hint: "Styles and goals that fit you. We'll shape every meal around them.",
    groups: ["style", "nutrition"],
  },
  {
    key: "dietaryNeeds",
    label: "Dietary needs",
    hint: "Faith, allergies, and intolerances. Every meal we suggest will follow them.",
    groups: ["faith", "allergy"],
  },
];

const DIET_GROUPS: Record<DietGroup, { label: string; tile: string }> = {
  style: { label: "Way of eating", tile: "bg-sage-soft text-sage-ink" },
  nutrition: { label: "Nutrition goals", tile: "bg-saffron-soft text-saffron-ink" },
  faith: { label: "Faith & culture", tile: "bg-plum-soft text-plum-ink" },
  allergy: { label: "Allergies & intolerances", tile: "bg-tomato-soft text-tomato-ink" },
};

const DIET_ICONS: Record<DietaryRestriction, LucideIcon> = {
  vegetarian: Carrot,
  vegan: Vegan,
  pescatarian: Fish,
  flexitarian: Salad,
  mediterranean: Grape,
  paleo: Drumstick,
  "high-protein": Dumbbell,
  "low-carb": Croissant,
  keto: Flame,
  "low-sugar": CandyOff,
  "heart-healthy": HeartPulse,
  "high-fiber": Bean,
  halal: MoonStar,
  kosher: BadgeCheck,
  "no-beef": BeefOff,
  jain: HandHeart,
  buddhist: Flower2,
  lenten: FishSymbol,
  "gluten-free": WheatOff,
  "dairy-free": MilkOff,
  "egg-free": EggOff,
  "soy-free": BeanOff,
  "nut-free": NutOff,
  "shellfish-free": ShrimpOff,
};

const FOOD_LISTS = [
  {
    key: "cannotEat",
    label: "Foods you can't eat",
    hint: "Other allergies and anything that's off the table. We'll never plan a meal with these.",
    placeholder: "Type any food, like kiwi or peaches…",
    suggestions: CANNOT_EAT_SUGGESTIONS,
    tone: "tomato",
  },
  {
    key: "dislikes",
    label: "Foods you'd rather skip",
    hint: "Not dangerous, just not your thing.",
    placeholder: "Type any food, like capers or radishes…",
    suggestions: DISLIKE_SUGGESTIONS,
    tone: "saffron",
  },
  {
    key: "likes",
    label: "Foods you love",
    hint: "Ingredients and dishes you're always happy to see on the table.",
    placeholder: "Type any food, like dumplings or ramen…",
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
  const id = useId();
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
      {DIET_SECTIONS.map((section) => (
        <fieldset
          key={section.key}
          hidden={stepped && only !== section.key}
          className={sectionClassName}
        >
          <legend className={stepped ? "sr-only" : "text-base font-semibold"}>
            {section.label}
          </legend>
          {!stepped && <p className="mt-0.5 mb-4 text-sm text-muted-foreground">{section.hint}</p>}
          <div className={cn("space-y-5", !stepped && CARD)}>
            {section.groups.map((group) => (
              <div key={group} role="group" aria-labelledby={`${id}-${group}`}>
                <p
                  id={`${id}-${group}`}
                  className="mb-2.5 text-xs font-semibold tracking-widest text-muted-foreground uppercase"
                >
                  {DIET_GROUPS[group].label}
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {DIETARY_RESTRICTIONS.filter((option) => option.group === group).map(
                    ({ value, label, hint }) => {
                      const selected = restrictions.includes(value);
                      const Icon = selected ? Check : DIET_ICONS[value];
                      return (
                        <button
                          key={value}
                          type="button"
                          aria-pressed={selected}
                          aria-describedby={`${id}-${value}`}
                          onClick={() => toggleRestriction(value)}
                          className={cn(
                            "flex min-w-0 cursor-pointer items-center gap-3 rounded-2xl border p-2.5 text-left transition-all outline-none focus-visible:ring-4 focus-visible:ring-ring/20 active:scale-[0.98] sm:p-3",
                            selected
                              ? "border-primary bg-accent ring-1 ring-primary"
                              : "bg-card hover:border-foreground/20 hover:bg-secondary/40",
                          )}
                        >
                          <span
                            aria-hidden
                            className={cn(
                              "grid size-9 shrink-0 place-items-center rounded-xl transition-colors",
                              selected
                                ? "bg-primary text-primary-foreground"
                                : DIET_GROUPS[group].tile,
                            )}
                          >
                            <Icon
                              key={String(selected)}
                              className={cn("size-[18px]", selected && "animate-pop-in")}
                              strokeWidth={selected ? 3 : 2}
                            />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm leading-tight font-medium">{label}</span>
                            {/* Read as the button's description, not part of its name. */}
                            <span
                              id={`${id}-${value}`}
                              aria-hidden
                              title={hint}
                              className="mt-0.5 hidden truncate text-xs text-muted-foreground sm:block"
                            >
                              {hint}
                            </span>
                          </span>
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            ))}
          </div>
        </fieldset>
      ))}
      {restrictions.map((value) => (
        <input key={value} type="hidden" name="dietaryRestrictions" value={value} />
      ))}

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
