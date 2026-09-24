"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChefHat,
  Flame,
  Loader2,
  Sprout,
  Timer,
  User,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { FoodTile } from "@/components/food-tile";
import { Logo } from "@/components/logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BUDGETS,
  COOK_TIMES,
  COOKING_CONFIDENCE,
  CUISINES,
  DIETARY_RESTRICTIONS,
  DISLIKE_SUGGESTIONS,
  LEFTOVERS,
  STAPLE_GROUPS,
  USE_SOON_SUGGESTIONS,
  type OnboardingInput,
} from "@/lib/onboarding";
import { cn, sentenceCase } from "@/lib/utils";
import { saveOnboarding } from "./actions";
import { Chip, Field, OptionCard, Stepper, TagInput } from "./fields";

const STEPS = [
  {
    label: "Household",
    eyebrow: "Your table",
    title: "Who's at the table?",
    description: "We'll size recipes and grocery quantities to fit.",
  },
  {
    label: "Tastes",
    eyebrow: "Your tastes",
    title: "What do you love to eat?",
    description: "Pick as many as you like. You can change these anytime.",
  },
  {
    label: "Cooking",
    eyebrow: "Your routine",
    title: "How do you like to cook?",
    description: "So weeknight plans fit your evenings, not the other way around.",
  },
  {
    label: "Kitchen",
    eyebrow: "Your kitchen",
    title: "What's usually in your kitchen?",
    description:
      "Tap the staples you almost always have. It doesn't need to be perfect. We'll double-check before you shop.",
  },
] as const;

const CONFIDENCE_ICONS = {
  beginner: <FoodTile icon={Sprout} tone="sage" className="size-10 rounded-xl" />,
  comfortable: <FoodTile icon={ChefHat} tone="saffron" className="size-10 rounded-xl" />,
  confident: <FoodTile icon={Flame} tone="tomato" className="size-10 rounded-xl" />,
};

const PERSON_TONES = [
  "bg-sage-soft text-sage-ink",
  "bg-saffron-soft text-saffron-ink",
  "bg-tomato-soft text-tomato-ink",
  "bg-sky-soft text-sky-ink",
  "bg-plum-soft text-plum-ink",
];

type ListKey = "cuisines" | "dietaryRestrictions" | "staples";
type TagKey = "dislikes" | "useSoon";

export function OnboardingFlow({
  initial,
  isEditing,
}: {
  initial: OnboardingInput;
  isEditing: boolean;
}) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const canContinue = step !== 0 || form.displayName.trim().length > 0;

  const set = <K extends keyof OnboardingInput>(key: K, value: OnboardingInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggle = <K extends ListKey>(key: K, value: OnboardingInput[K][number]) =>
    setForm((prev) => {
      const list = prev[key] as string[];
      return {
        ...prev,
        [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
      };
    });

  // Functional updates so several adds in one event (e.g. blur + click) all stick.
  const addTag = (key: TagKey, name: string) =>
    setForm((prev) => (prev[key].includes(name) ? prev : { ...prev, [key]: [...prev[key], name] }));
  const removeTag = (key: TagKey, name: string) =>
    setForm((prev) => ({ ...prev, [key]: prev[key].filter((v) => v !== name) }));

  const goTo = (index: number) => {
    setError(null);
    setStep(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onContinue = () => {
    if (!isLast) return goTo(step + 1);
    setError(null);
    startSaving(async () => {
      const result = await saveOnboarding(form);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-18 max-w-3xl items-center justify-between px-6">
          <Logo href={isEditing ? "/dashboard" : "/"} />
          {isEditing ? (
            <Link href="/dashboard" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              Cancel
            </Link>
          ) : (
            <span className="text-sm text-muted-foreground">
              Step {step + 1} of {STEPS.length}
            </span>
          )}
        </div>
        <nav aria-label="Setup steps" className="mx-auto max-w-3xl px-6 pb-4">
          <ol className="grid grid-cols-4 gap-2">
            {STEPS.map((s, index) => {
              const reachable = isEditing || index <= step;
              return (
                <li key={s.label}>
                  <button
                    type="button"
                    onClick={() => goTo(index)}
                    disabled={!reachable || saving}
                    aria-current={index === step ? "step" : undefined}
                    className="group w-full cursor-pointer text-left disabled:cursor-default"
                  >
                    <span
                      className={cn(
                        "block h-1.5 rounded-full transition-colors duration-500",
                        index <= step ? "bg-primary" : "bg-border",
                      )}
                    />
                    <span
                      className={cn(
                        "mt-2 hidden text-xs font-medium transition-colors sm:block",
                        index === step ? "text-foreground" : "text-muted-foreground",
                        reachable && index !== step && "group-hover:text-foreground",
                      )}
                    >
                      {s.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 pt-10 pb-36 sm:pt-14">
        <div key={step} className="animate-fade-up">
          <p className="text-sm font-semibold tracking-[0.14em] text-tomato-ink uppercase">
            {current.eyebrow}
          </p>
          <h1 className="mt-2 font-display text-4xl leading-tight font-medium sm:text-5xl">
            {current.title}
          </h1>
          <p className="mt-3 max-w-xl text-lg text-muted-foreground">{current.description}</p>

          <div className="mt-12 space-y-12">
            {step === 0 && (
              <>
                <Field label="What should we call you?">
                  <Input
                    value={form.displayName}
                    onChange={(e) => set("displayName", e.target.value)}
                    placeholder="Your first name"
                    maxLength={60}
                    autoComplete="given-name"
                    className="max-w-sm"
                    aria-label="Your name"
                  />
                </Field>

                <Field label="How many people are you cooking for?" hint="Including you.">
                  <div className="flex flex-wrap items-center gap-6">
                    <Stepper
                      value={form.householdSize}
                      min={1}
                      max={12}
                      onChange={(value) => set("householdSize", value)}
                      label="people"
                    />
                    <div className="flex -space-x-2" aria-hidden>
                      {Array.from({ length: Math.min(form.householdSize, 6) }, (_, i) => (
                        <span
                          key={i}
                          className={cn(
                            "grid size-10 animate-fade-up place-items-center rounded-full border-2 border-background",
                            PERSON_TONES[i % PERSON_TONES.length],
                          )}
                        >
                          <User className="size-4" />
                        </span>
                      ))}
                      {form.householdSize > 6 && (
                        <span className="grid size-10 place-items-center rounded-full border-2 border-background bg-muted text-xs font-semibold text-muted-foreground">
                          +{form.householdSize - 6}
                        </span>
                      )}
                    </div>
                  </div>
                </Field>

                <Field
                  label="How many dinners should we plan each week?"
                  hint="Most people start with 4. Leftover nights and nights out are easy to add later."
                >
                  <div role="radiogroup" aria-label="Dinners per week" className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((count) => {
                      const selected = form.dinnersPerWeek === count;
                      return (
                        <button
                          key={count}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => set("dinnersPerWeek", count)}
                          className={cn(
                            "grid size-14 cursor-pointer place-items-center rounded-2xl border font-display text-xl font-medium transition-all outline-none focus-visible:ring-4 focus-visible:ring-ring/20 active:scale-95",
                            selected
                              ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                              : "bg-card hover:border-foreground/20",
                          )}
                        >
                          {count}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              </>
            )}

            {step === 1 && (
              <>
                <Field label="Cuisines you're into">
                  <div className="flex flex-wrap gap-2">
                    {CUISINES.map((cuisine) => (
                      <Chip
                        key={cuisine}
                        selected={form.cuisines.includes(cuisine)}
                        onToggle={() => toggle("cuisines", cuisine)}
                      >
                        {cuisine}
                      </Chip>
                    ))}
                  </div>
                </Field>

                <Field
                  label="Any dietary needs?"
                  hint="We'll never suggest a meal that breaks these."
                >
                  <div className="flex flex-wrap gap-2">
                    {DIETARY_RESTRICTIONS.map((option) => (
                      <Chip
                        key={option.value}
                        selected={form.dietaryRestrictions.includes(option.value)}
                        onToggle={() => toggle("dietaryRestrictions", option.value)}
                      >
                        {option.label}
                      </Chip>
                    ))}
                  </div>
                </Field>

                <Field
                  label="Anything you'd rather skip?"
                  hint="Ingredients or dishes you don't enjoy. Press Enter to add."
                >
                  <TagInput
                    values={form.dislikes}
                    onAdd={(name) => addTag("dislikes", name)}
                    onRemove={(name) => removeTag("dislikes", name)}
                    suggestions={DISLIKE_SUGGESTIONS}
                    placeholder="e.g. mushrooms"
                    tone="tomato"
                    label="Foods to skip"
                  />
                </Field>
              </>
            )}

            {step === 2 && (
              <>
                <Field label="How much time for a weeknight dinner?">
                  <div role="radiogroup" aria-label="Cooking time" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {COOK_TIMES.map((option) => (
                      <OptionCard
                        key={option.value}
                        selected={form.maxCookMinutes === option.value}
                        onSelect={() => set("maxCookMinutes", option.value)}
                        icon={<Timer className="size-5 text-sage-ink" />}
                        title={option.label}
                        description={option.description}
                      />
                    ))}
                  </div>
                </Field>

                <Field label="How confident are you in the kitchen?">
                  <div role="radiogroup" aria-label="Cooking confidence" className="grid gap-3 sm:grid-cols-3">
                    {COOKING_CONFIDENCE.map((option) => (
                      <OptionCard
                        key={option.value}
                        selected={form.cookingConfidence === option.value}
                        onSelect={() => set("cookingConfidence", option.value)}
                        icon={CONFIDENCE_ICONS[option.value]}
                        title={option.label}
                        description={option.description}
                      />
                    ))}
                  </div>
                </Field>

                <div className="grid gap-12 lg:grid-cols-2 lg:gap-6">
                  <Field label="Leftovers?">
                    <div role="radiogroup" aria-label="Leftovers" className="grid gap-2">
                      {LEFTOVERS.map((option) => (
                        <OptionCard
                          key={option.value}
                          selected={form.leftovers === option.value}
                          onSelect={() => set("leftovers", option.value)}
                          title={option.label}
                          description={option.description}
                          className="py-3"
                        />
                      ))}
                    </div>
                  </Field>

                  <Field label="Grocery budget">
                    <div role="radiogroup" aria-label="Grocery budget" className="grid gap-2">
                      {BUDGETS.map((option) => (
                        <OptionCard
                          key={option.value}
                          selected={form.budget === option.value}
                          onSelect={() => set("budget", option.value)}
                          title={
                            <span className="flex items-baseline gap-2">
                              <span className="w-9 font-display text-lg text-sage-ink">
                                {option.symbol}
                              </span>
                              {option.label}
                            </span>
                          }
                          className="py-3"
                        />
                      ))}
                    </div>
                  </Field>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <Field
                  label="Kitchen staples"
                  aside={
                    <span className="shrink-0 text-sm text-muted-foreground">
                      {form.staples.length} selected
                    </span>
                  }
                >
                  <div className="space-y-6 rounded-3xl border bg-card p-6">
                    {STAPLE_GROUPS.map((group) => (
                      <div key={group.label}>
                        <p className="mb-3 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                          {group.label}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {group.items.map((item) => (
                            <Chip
                              key={item}
                              selected={form.staples.includes(item)}
                              onToggle={() => toggle("staples", item)}
                            >
                              {sentenceCase(item)}
                            </Chip>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Field>

                <Field
                  label="Anything you'd like to use up soon?"
                  hint="Leftover ingredients in the fridge. We'll try to work them into your first plan."
                >
                  <TagInput
                    values={form.useSoon}
                    onAdd={(name) => addTag("useSoon", name)}
                    onRemove={(name) => removeTag("useSoon", name)}
                    suggestions={USE_SOON_SUGGESTIONS}
                    placeholder="e.g. spinach"
                    tone="saffron"
                    label="Ingredients to use soon"
                  />
                </Field>
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => goTo(step - 1)}
            disabled={step === 0 || saving}
            className={cn(step === 0 && "invisible")}
          >
            <ArrowLeft />
            Back
          </Button>

          {error && (
            <p role="alert" className="text-sm text-tomato-ink">
              {error}
            </p>
          )}

          <Button
            type="button"
            size="lg"
            onClick={onContinue}
            disabled={!canContinue || saving}
            className="min-w-40"
          >
            {saving ? (
              <Loader2 className="animate-spin" />
            ) : isLast ? (
              <>
                {isEditing ? "Save changes" : "Finish setup"}
                <Check />
              </>
            ) : (
              <>
                Continue
                <ArrowRight />
              </>
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
}
