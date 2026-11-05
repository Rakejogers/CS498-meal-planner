"use client";

import {
  Beef,
  Check,
  Copy,
  Croissant,
  Leaf,
  Milk,
  Package,
  RotateCcw,
  ShoppingBasket,
  Snowflake,
  Carrot,
  type LucideIcon,
} from "lucide-react";
import { useId, useMemo, useState, useSyncExternalStore } from "react";
import { MealNumber } from "@/components/meal-number";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AISLE_LABELS,
  formatGroceryAmount,
  groceryListText,
  groupByAisle,
  type GroceryItem,
} from "@/lib/groceries";
import type { Aisle } from "@/lib/meal-plan";
import { cn, sentenceCase } from "@/lib/utils";

const AISLE_LOOKS: Record<Aisle, { icon: LucideIcon; tile: string }> = {
  produce: { icon: Carrot, tile: "bg-sage-soft text-sage-ink" },
  "meat-seafood": { icon: Beef, tile: "bg-tomato-soft text-tomato-ink" },
  "dairy-eggs": { icon: Milk, tile: "bg-sky-soft text-sky-ink" },
  bakery: { icon: Croissant, tile: "bg-saffron-soft text-saffron-ink" },
  pantry: { icon: Package, tile: "bg-saffron-soft text-saffron-ink" },
  spices: { icon: Leaf, tile: "bg-plum-soft text-plum-ink" },
  frozen: { icon: Snowflake, tile: "bg-sky-soft text-sky-ink" },
  other: { icon: ShoppingBasket, tile: "bg-secondary text-foreground" },
};

export function GroceryList({
  planId,
  meals,
  items,
}: {
  planId: string;
  /** Titles of the plan's dinners, in order. */
  meals: string[];
  items: GroceryItem[];
}) {
  const [inBasket, setInBasket] = useBasket(planId);
  const [copyStatus, setCopyStatus] = useState("");
  const groups = useMemo(() => groupByAisle(items), [items]);

  const done = items.filter((item) => inBasket.has(item.name)).length;
  const left = items.filter((item) => !inBasket.has(item.name));

  const toggle = (name: string) => {
    const next = new Set(inBasket);
    if (!next.delete(name)) next.add(name);
    setInBasket(next);
  };

  async function copyList() {
    try {
      await navigator.clipboard.writeText(groceryListText(left.length ? left : items));
      setCopyStatus(done && left.length ? "Copied what's left to buy." : "Grocery list copied.");
    } catch {
      setCopyStatus("Couldn't copy the list. You can select and copy the items instead.");
    }
  }

  return (
    <div className="mt-9 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_19rem]">
      <aside className="space-y-5 lg:sticky lg:top-24 lg:order-last">
        <Card className="p-6">
          <p className="text-sm font-medium text-muted-foreground">In your basket</p>
          <p className="mt-1 font-display text-4xl font-medium tabular-nums">
            {done}
            <span className="text-2xl text-muted-foreground"> / {items.length}</span>
          </p>
          <div
            role="progressbar"
            aria-label="Items in your basket"
            aria-valuemin={0}
            aria-valuemax={items.length}
            aria-valuenow={done}
            className="mt-4 h-2 overflow-hidden rounded-full bg-secondary"
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
              style={{ width: `${items.length ? (done / items.length) * 100 : 0}%` }}
            />
          </div>
          {done === items.length && items.length > 0 && (
            <p className="mt-3 animate-fade-up text-sm font-medium text-sage-ink">
              Everything&apos;s in the basket. Enjoy the week!
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={copyList}>
              <Copy aria-hidden="true" /> Copy list
            </Button>
            {done > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => setInBasket(new Set())}
              >
                <RotateCcw aria-hidden="true" /> Start over
              </Button>
            )}
          </div>
          <p role="status" className="mt-3 text-sm text-primary empty:hidden">
            {copyStatus}
          </p>
        </Card>

        <DinnersKey meals={meals} className="hidden lg:block" />
      </aside>

      <div className="space-y-8">
        {groups.map(({ aisle, items }, index) => {
          const { icon: Icon, tile } = AISLE_LOOKS[aisle];
          const label = AISLE_LABELS[aisle];
          const aisleDone = items.filter((item) => inBasket.has(item.name)).length;
          return (
            <section
              key={aisle}
              aria-labelledby={`aisle-${aisle}`}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="mb-3 flex items-center gap-3">
                <span aria-hidden className={cn("grid size-9 place-items-center rounded-xl", tile)}>
                  <Icon className="size-4.5" />
                </span>
                <h2 id={`aisle-${aisle}`} className="font-display text-xl font-medium">
                  {label}
                </h2>
                <span className="ml-auto text-sm text-muted-foreground tabular-nums">
                  {aisleDone ? `${aisleDone} of ${items.length}` : items.length}
                </span>
              </div>
              <Card className="overflow-hidden">
                <ul aria-label={label} className="divide-y">
                  {items.map((item) => (
                    <GroceryRow
                      key={item.name}
                      item={item}
                      meals={meals}
                      checked={inBasket.has(item.name)}
                      onToggle={() => toggle(item.name)}
                    />
                  ))}
                </ul>
              </Card>
            </section>
          );
        })}
        {/* On small screens the key follows the list instead of pushing it down. */}
        <DinnersKey meals={meals} className="lg:hidden" />
      </div>
    </div>
  );
}

/** The plan's dinners with their numbers, so an item's dots can be read. */
function DinnersKey({ meals, className }: { meals: string[]; className?: string }) {
  const headingId = useId();
  return (
    <div className={cn("space-y-4", className)}>
      <Card className="p-6">
        <h2 id={headingId} className="font-display text-lg font-medium">
          This week&apos;s dinners
        </h2>
        <ol aria-labelledby={headingId} className="mt-4 space-y-3">
          {meals.map((title, position) => (
            <li key={position} className="flex items-start gap-3 text-sm leading-snug">
              <MealNumber position={position} size="sm" className="mt-px" />
              <span className="min-w-0 wrap-anywhere">{title}</span>
            </li>
          ))}
        </ol>
      </Card>
      <p className="px-1 text-xs leading-relaxed text-muted-foreground">
        Amounts are full recipe totals, so check your kitchen first. Weight and volume stay
        separate; cups and spoons are US measures.
      </p>
    </div>
  );
}

function GroceryRow({
  item,
  meals,
  checked,
  onToggle,
}: {
  item: GroceryItem;
  meals: string[];
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <li>
      <label className="flex cursor-pointer items-center gap-4 px-5 py-3.5 transition-colors hover:bg-secondary/50">
        <span className="relative grid size-5 shrink-0 place-items-center">
          <input
            type="checkbox"
            checked={checked}
            onChange={onToggle}
            className="peer size-5 cursor-pointer appearance-none rounded-md border-2 border-input bg-card transition-colors outline-none checked:border-primary checked:bg-primary focus-visible:ring-4 focus-visible:ring-ring/20"
          />
          {checked && (
            <Check
              aria-hidden
              strokeWidth={3}
              className="pointer-events-none absolute size-3.5 animate-pop-in text-primary-foreground"
            />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block font-medium wrap-anywhere transition-colors",
              checked && "text-muted-foreground line-through decoration-muted-foreground/60",
            )}
          >
            {sentenceCase(item.name)}
          </span>
          <span className="mt-1 flex flex-wrap gap-1">
            {item.meals.map((position) => (
              <MealNumber key={position} position={position} size="sm" />
            ))}
            <span className="sr-only">
              , for {item.meals.map((position) => meals[position]).join(", ")}
            </span>
          </span>
        </span>
        <span
          className={cn(
            "shrink-0 text-right font-medium tabular-nums transition-colors",
            checked ? "text-muted-foreground" : "text-primary",
          )}
        >
          {item.amounts.map(formatGroceryAmount).join(" + ")}
        </span>
      </label>
    </li>
  );
}

// What's already in the basket, per plan, kept in this browser so it survives
// a reload in the store. A new plan starts an empty basket.
const STORAGE_PREFIX = "plantry:basket:";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function readBasket(raw: string | null) {
  try {
    const value: unknown = JSON.parse(raw ?? "[]");
    return new Set(Array.isArray(value) ? value.filter((name) => typeof name === "string") : []);
  } catch {
    return new Set<string>();
  }
}

function useBasket(planId: string) {
  const key = STORAGE_PREFIX + planId;
  const raw = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(key),
    () => null,
  );
  const basket = useMemo(() => readBasket(raw), [raw]);

  const save = (next: Set<string>) => {
    try {
      // Older plans' baskets are no longer needed.
      for (const stored of Object.keys(localStorage)) {
        if (stored.startsWith(STORAGE_PREFIX) && stored !== key) localStorage.removeItem(stored);
      }
      localStorage.setItem(key, JSON.stringify([...next]));
    } catch {
      // Storage can be unavailable (private browsing); the basket just won't persist.
    }
    listeners.forEach((listener) => listener());
  };

  return [basket, save] as const;
}
