"use client";

import {
  Carrot,
  Check,
  Clock,
  Droplets,
  Egg,
  LeafyGreen,
  Lock,
  LockOpen,
  Pause,
  Play,
  RefreshCw,
  Sprout,
  Store,
  Wheat,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useReducer, useState, type ReactNode } from "react";
import { MealNumber } from "@/components/meal-number";
import { Badge, type Tone } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// The brand panel beside the log-in form. It moves through the product one
// step at a time: plan, kitchen, groceries, cart. Each step is a small acted-out
// sketch of the app with sample data, not a screenshot, so it is hidden from
// screen readers; the caption beside it says the same thing in words.

type Scene = { id: string; label: string; title: ReactNode; body: string; Sketch: () => ReactNode };

const accent = (text: string) => <em className="font-normal text-saffron italic">{text}</em>;

const SCENES: Scene[] = [
  {
    id: "plan",
    label: "Plan",
    title: <>What&apos;s for dinner? {accent("Already answered.")}</>,
    body: "A week of dinners that fits your household. Keep the ones you like, swap the ones you don't.",
    Sketch: PlanSketch,
  },
  {
    id: "kitchen",
    label: "Kitchen",
    title: <>Starts with what&apos;s {accent("already in your kitchen.")}</>,
    body: "Tell Plantry roughly what you have. No counting, no scanning.",
    Sketch: KitchenSketch,
  },
  {
    id: "groceries",
    label: "Groceries",
    title: <>One tidy list {accent("for the whole week.")}</>,
    body: "Every ingredient added up across your dinners and sorted by aisle.",
    Sketch: GroceriesSketch,
  },
  {
    id: "cart",
    label: "Cart",
    title: <>Into your cart, {accent("when you say so.")}</>,
    body: "Review each item, then send it all to your store. Nothing is added without you.",
    Sketch: CartSketch,
  },
];

type State = {
  active: number;
  /** How many times each scene has been shown. A scene's sketch restarts when its count changes. */
  runs: number[];
  playing: boolean;
};

type Action = { type: "next" } | { type: "go"; index: number } | { type: "toggle" };

function reducer(state: State, action: Action): State {
  if (action.type === "toggle") return { ...state, playing: !state.playing };
  const index = action.type === "next" ? (state.active + 1) % SCENES.length : action.index;
  return {
    active: index,
    runs: state.runs.map((count, i) => (i === index ? count + 1 : count)),
    // Picking a step by hand stops the rotation, so it doesn't move away mid-read.
    playing: action.type === "next" && state.playing,
  };
}

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

/** Where a scene sits relative to the one showing: it scrolls up and out, the next scrolls up and in. */
function placement(index: number, active: number) {
  const offset = (index - active + SCENES.length) % SCENES.length;
  if (offset === 0) return "active";
  return offset === SCENES.length - 1 ? "before" : "after";
}

export function FeatureShowcase() {
  const [{ active, runs, playing }, dispatch] = useReducer(reducer, {
    active: 0,
    runs: SCENES.map((_, index) => (index === 0 ? 1 : 0)),
    playing: true,
  });

  return (
    <div className="relative mx-auto flex w-full max-w-md flex-1 animate-rise flex-col [animation-delay:150ms] xl:max-w-lg">
      <div aria-hidden className="relative flex flex-1 items-center py-2 lg:py-4">
        {/* A plate under the sketch: the one fixed thing while the steps change. */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 aspect-square w-[128%] max-w-[34rem] -translate-1/2 rounded-full bg-primary-foreground/[0.035] ring-1 ring-primary-foreground/10">
          <div className="absolute inset-[12%] rounded-full ring-1 ring-primary-foreground/[0.07]" />
        </div>
        <div className="relative grid w-full xl:[zoom:1.1] short:[zoom:1]!">
          {SCENES.map(({ id, Sketch }, index) => {
            const place = placement(index, active);
            return (
              <div
                key={id}
                className={cn(
                  "col-start-1 row-start-1 self-center transition-[opacity,translate] duration-700 motion-reduce:transition-none",
                  EASE,
                  // The old step leaves quickly; the new one follows a beat behind it.
                  place === "active" ? "delay-200" : "pointer-events-none opacity-0 duration-400",
                  place === "before" && "-translate-y-20",
                  place === "after" && "translate-y-20",
                )}
              >
                <Sketch key={runs[index]} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid lg:mt-6 short:mt-4!">
        {SCENES.map(({ id, title, body }, index) => {
          const place = placement(index, active);
          return (
            <div
              key={id}
              aria-hidden={place !== "active"}
              className={cn(
                "col-start-1 row-start-1 transition-[opacity,translate] duration-700 motion-reduce:transition-none",
                EASE,
                place === "active" ? "delay-300" : "opacity-0 duration-300",
                place === "before" && "-translate-y-5",
                place === "after" && "translate-y-5",
              )}
            >
              <p className="font-display text-3xl leading-[1.1] font-medium text-balance text-primary-foreground xl:text-4xl">
                {title}
              </p>
              <p className="mt-3 max-w-sm leading-relaxed text-primary-foreground/70 short:hidden">
                {body}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-end gap-4 short:mt-6">
        <ul aria-label="What Plantry does" className="grid flex-1 grid-cols-4 gap-2">
          {SCENES.map(({ id, label }, index) => (
            <li key={id}>
              <button
                type="button"
                aria-current={index === active ? "step" : undefined}
                onClick={() => dispatch({ type: "go", index })}
                className={cn(
                  "block w-full cursor-pointer rounded-md pt-2 pb-1 text-left text-xs font-medium transition-colors outline-none focus-visible:ring-4 focus-visible:ring-primary-foreground/25",
                  index === active
                    ? "text-primary-foreground"
                    : "text-primary-foreground/50 hover:text-primary-foreground/80",
                )}
              >
                <span className="block h-0.5 overflow-hidden rounded-full bg-primary-foreground/20">
                  {index === active && (
                    // The bar is the timer: when it finishes filling, the next step comes up.
                    // Without motion it has no animation, so the panel stays where it is.
                    <span
                      key={runs[index]}
                      onAnimationEnd={() => dispatch({ type: "next" })}
                      className={cn(
                        "block h-full origin-left rounded-full bg-primary-foreground/90",
                        playing && "motion-safe:animate-fill-x",
                      )}
                    />
                  )}
                </span>
                <span className="mt-2.5 block">{label}</span>
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => dispatch({ type: "toggle" })}
          aria-label={playing ? "Pause the tour" : "Play the tour"}
          className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full text-primary-foreground/60 transition-colors outline-none hover:bg-primary-foreground/10 hover:text-primary-foreground focus-visible:ring-4 focus-visible:ring-primary-foreground/25 motion-reduce:hidden"
        >
          {playing ? (
            <Pause aria-hidden className="size-3.5 fill-current" />
          ) : (
            <Play aria-hidden className="size-3.5 fill-current" />
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * Counts up through `delays` (ms after the sketch appears), so a sketch can act
 * out a short sequence. Without motion it goes straight to the end.
 */
function useSteps(delays: readonly number[]) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers = delays.map((delay, index) =>
      setTimeout(() => setStep(index + 1), still ? 0 : delay),
    );
    return () => timers.forEach(clearTimeout);
  }, [delays]);
  return step;
}

const SURFACE =
  "rounded-2xl bg-card text-card-foreground shadow-[0_1px_2px_rgba(12,26,16,0.12),0_18px_36px_-18px_rgba(12,26,16,0.55)]";

function Tile({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return (
    <span
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-xl bg-secondary text-foreground",
        className,
      )}
    >
      <Icon className="size-4.5" />
    </span>
  );
}

/** A round checkbox that fills in when `on`. */
function Tick({ on }: { on: boolean }) {
  return (
    <span
      className={cn(
        "grid size-5 shrink-0 place-items-center rounded-full border-[1.5px] transition-colors duration-300",
        on ? "border-primary bg-primary text-primary-foreground" : "border-input",
      )}
    >
      {on && <Check className="size-3 animate-pop-in stroke-3" />}
    </span>
  );
}

// ── Plan: keep one dinner, swap another ─────────────────────────────────────

const PLAN_STEPS = [1500, 2800] as const;

function PlanSketch() {
  const step = useSteps(PLAN_STEPS);
  const kept = step >= 1;
  const swapped = step >= 2;

  return (
    <div className="space-y-3">
      <DinnerCard
        position={0}
        title="Lemon chicken orzo"
        minutes={35}
        reason="Uses your spinach"
        className="mr-6 sm:mr-10"
      >
        <span
          key={kept ? "kept" : "open"}
          className={cn(
            "grid size-7 place-items-center rounded-full",
            kept ? "animate-pop-in bg-sage-soft text-sage-ink" : "text-muted-foreground/70",
          )}
        >
          {kept ? <Lock className="size-3.5" /> : <LockOpen className="size-3.5" />}
        </span>
      </DinnerCard>

      <DinnerCard
        position={1}
        title={swapped ? "Black bean tacos" : "Beef tacos"}
        minutes={swapped ? 25 : 30}
        reason="Shares the cilantro"
        fresh={swapped}
        className="ml-6 [animation-delay:90ms] sm:ml-10"
      >
        <span
          className={cn(
            "grid size-7 place-items-center rounded-full transition-[rotate,background-color,color] duration-700",
            EASE,
            swapped ? "rotate-360 bg-saffron-soft text-saffron-ink" : "text-muted-foreground/70",
          )}
        >
          <RefreshCw className="size-3.5" />
        </span>
      </DinnerCard>

      <DinnerCard
        position={2}
        title="Sheet-pan salmon"
        minutes={30}
        reason="Leftovers for lunch"
        className="mr-6 [animation-delay:180ms] sm:mr-10"
      >
        <span className="grid size-7 place-items-center rounded-full text-muted-foreground/70">
          <LockOpen className="size-3.5" />
        </span>
      </DinnerCard>
    </div>
  );
}

function DinnerCard({
  position,
  title,
  minutes,
  reason,
  fresh = false,
  className,
  children,
}: {
  position: number;
  title: string;
  minutes: number;
  reason: string;
  /** The dinner was just swapped in, so its name rolls into place. */
  fresh?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn(SURFACE, "animate-fade-up p-3.5", className)}>
      <div className="flex items-center gap-3">
        <MealNumber position={position} />
        <p className="min-w-0 flex-1 overflow-hidden font-display text-[1.0625rem] font-medium">
          <span key={title} className={cn("block truncate", fresh && "animate-tick-up")}>
            {title}
          </span>
        </p>
        {children}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5 pl-11">
        <Badge tone="saffron">
          <Clock />
          {minutes} min
        </Badge>
        <Badge>{reason}</Badge>
      </div>
    </div>
  );
}

// ── Kitchen: a rough answer per item, then a dinner that uses them ──────────

const KITCHEN_STEPS = [1500, 2700] as const;

const SHELF: { name: string; icon: LucideIcon; state: string; tone: Tone }[] = [
  { name: "Spinach", icon: LeafyGreen, state: "Have", tone: "sage" },
  { name: "Olive oil", icon: Droplets, state: "Running low", tone: "saffron" },
  { name: "Eggs", icon: Egg, state: "Out", tone: "tomato" },
];

function KitchenSketch() {
  const step = useSteps(KITCHEN_STEPS);
  const answered = step >= 1;
  const used = step >= 2;

  return (
    <div className="relative pb-9">
      <div className={cn(SURFACE, "animate-fade-up px-4 pt-4 pb-2")}>
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-display text-[1.0625rem] font-medium">Your kitchen</p>
          <p className="text-xs text-muted-foreground">A rough idea is plenty</p>
        </div>
        <ul className="mt-2 divide-y">
          {SHELF.map(({ name, icon, state, tone }) => (
            <li key={name} className="flex items-center gap-3 py-2">
              <Tile icon={icon} />
              <span className="flex-1 text-sm font-medium">{name}</span>
              <Badge tone={tone}>{state}</Badge>
            </li>
          ))}
          <li className="flex items-center gap-3 py-2">
            <Tile icon={Wheat} />
            <span className="flex-1 text-sm font-medium">Rice</span>
            <Badge
              key={answered ? "have" : "unsure"}
              tone={answered ? "sage" : "plum"}
              className={cn(answered && "animate-pop-in")}
            >
              {answered ? "Have" : "Unsure"}
            </Badge>
          </li>
        </ul>
      </div>

      <div
        className={cn(
          SURFACE,
          "absolute right-0 bottom-0 flex items-center gap-2.5 py-2.5 pr-4 pl-2.5 transition-[opacity,translate,scale] duration-500 sm:-right-6",
          EASE,
          !used && "translate-y-3 scale-95 opacity-0",
        )}
      >
        <Tile icon={Sprout} className="bg-sage-soft text-sage-ink" />
        <p className="text-sm leading-tight">
          <span className="block text-xs text-muted-foreground">Tonight uses your</span>
          <span className="font-medium">spinach and rice</span>
        </p>
      </div>
    </div>
  );
}

// ── Groceries: one list, ticked off as you shop ─────────────────────────────

const GROCERY_STEPS = [1300, 2000, 2700] as const;

const PRODUCE: { name: string; amount: string; meals: number[] }[] = [
  { name: "Baby spinach", amount: "5 oz", meals: [0, 2] },
  { name: "Lemons", amount: "2", meals: [0] },
  { name: "Cilantro", amount: "1 bunch", meals: [1] },
  { name: "Potatoes", amount: "1½ lb", meals: [2] },
];

const LIST_TOTAL = 12;

function GroceriesSketch() {
  const done = useSteps(GROCERY_STEPS);

  return (
    <div className="relative pt-7">
      <div className={cn(SURFACE, "animate-fade-up px-4 pt-4 pb-2")}>
        <div className="flex items-center gap-3">
          <Tile icon={Carrot} className="bg-sage-soft text-sage-ink" />
          <p className="font-display text-[1.0625rem] font-medium">Produce</p>
        </div>
        <ul className="mt-2 divide-y">
          {PRODUCE.map(({ name, amount, meals }, index) => (
            <li key={name} className="flex items-center gap-3 py-2.5">
              <Tick on={index < done} />
              <span
                className={cn(
                  "min-w-0 flex-1 truncate text-sm font-medium transition-colors duration-300",
                  index < done && "text-muted-foreground line-through decoration-input",
                )}
              >
                {name}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">{amount}</span>
              <span className="flex w-11 justify-end gap-1">
                {meals.map((meal) => (
                  <MealNumber key={meal} position={meal} size="sm" />
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div
        className={cn(
          SURFACE,
          "absolute top-0 right-0 w-36 animate-fade-up px-3.5 py-3 [animation-delay:200ms] sm:-right-6",
        )}
      >
        <p className="text-xs text-muted-foreground">In your basket</p>
        <p className="mt-0.5 flex items-baseline gap-1 overflow-hidden font-display text-2xl font-medium tabular-nums">
          <span key={done} className={cn("inline-block", done > 0 && "animate-tick-up")}>
            {done}
          </span>
          <span className="text-base text-muted-foreground">/ {LIST_TOTAL}</span>
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div
            className={cn("h-full rounded-full bg-primary transition-[width] duration-500", EASE)}
            style={{ width: `${(done / LIST_TOTAL) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Cart: approve each match, then the send button wakes up ─────────────────

const CART_STEPS = [1300, 1900, 2500, 3300] as const;

const MATCHES: { product: string; need: string; price: string }[] = [
  { product: "Baby spinach, 5 oz", need: "Spinach", price: "$3.49" },
  { product: "Orzo pasta, 16 oz", need: "Orzo", price: "$2.29" },
  { product: "Chicken thighs, 1½ lb", need: "Chicken", price: "$7.90" },
];

function CartSketch() {
  const step = useSteps(CART_STEPS);
  const ready = step > MATCHES.length;

  return (
    <div className={cn(SURFACE, "animate-fade-up px-4 pt-4 pb-4")}>
      <div className="flex items-center gap-3">
        <Tile icon={Store} className="bg-sky-soft text-sky-ink" />
        <div>
          <p className="font-display text-[1.0625rem] leading-tight font-medium">
            Review your cart
          </p>
          <p className="text-xs text-muted-foreground">Matched at your store</p>
        </div>
      </div>

      <ul className="mt-2 divide-y">
        {MATCHES.map(({ product, need, price }, index) => (
          <li key={product} className="flex items-center gap-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{product}</p>
              <p className="text-xs text-muted-foreground">For: {need}</p>
            </div>
            <span className="text-sm text-muted-foreground tabular-nums">{price}</span>
            <Tick on={index < step} />
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between gap-3 border-t pt-3.5">
        <p className="text-xs text-muted-foreground">
          {LIST_TOTAL} items
          <span className="block font-display text-lg leading-tight font-medium text-foreground tabular-nums">
            $46.80
          </span>
        </p>
        <span
          className={cn(
            "inline-flex h-9 items-center rounded-full px-4 text-sm font-medium transition-[background-color,color,box-shadow,scale] duration-500",
            EASE,
            ready
              ? "scale-100 bg-primary text-primary-foreground shadow-sm shadow-primary/30"
              : "scale-95 bg-secondary text-muted-foreground",
          )}
        >
          Send to cart
        </span>
      </div>
    </div>
  );
}
