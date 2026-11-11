import {
  Carrot,
  Check,
  CircleHelp,
  Droplet,
  Egg,
  Milk,
  RefreshCw,
  ShoppingCart,
  Wheat,
  type LucideIcon,
} from "lucide-react";
import { MealNumber } from "@/components/meal-number";
import { Badge, type Tone } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { POP, RISE } from "./motion";
import { Reveal } from "./reveal";

// Illustrations of the product for the landing page. They are pictures, not
// working UI: all sample data, hidden from assistive technology.

const delay = (ms: number) => ({ animationDelay: `${ms}ms`, transitionDelay: `${ms}ms` });

/** A sample card on a tilted color panel that settles into place when scrolled to. */
function Frame({ wash, children }: { wash: string; children: React.ReactNode }) {
  return (
    <Reveal aria-hidden className="relative mx-auto w-full max-w-md select-none">
      <div
        className={cn(
          "absolute inset-0 rounded-[2rem] opacity-0 transition-[opacity,rotate] duration-1000 ease-out group-hover/reveal:duration-500 group-data-[shown]/reveal:-rotate-3 group-data-[shown]/reveal:opacity-100 group-data-[shown]/reveal:group-hover/reveal:-rotate-5 motion-reduce:transition-none",
          wash,
        )}
      />
      <Card
        className={cn(
          RISE,
          "relative p-5 shadow-[0_2px_4px_rgba(28,41,32,0.05),0_24px_48px_-20px_rgba(28,41,32,0.22)] transition-[translate] duration-500 ease-out group-hover/reveal:-translate-y-1 motion-reduce:transition-none sm:p-6",
        )}
      >
        {children}
      </Card>
    </Reveal>
  );
}

function FrameHeader({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <p className="font-display text-xl font-medium">{title}</p>
      {children}
    </div>
  );
}

const DINNERS = [
  { title: "Chicken tinga tacos", minutes: 25 },
  { title: "Salmon rice bowls", minutes: 30 },
  { title: "Black bean burritos", minutes: 20 },
  // The last night keeps trading places with another pick, to show a swap.
  { title: "Thai basil noodles", minutes: 25, swap: "Coconut lime curry" },
];

// Both layers of a swap share one grid cell.
const STACKED = "col-start-1 row-start-1";
const SWAP_A = "group-data-[shown]/reveal:animate-swap-a";
const SWAP_B = "opacity-0 group-data-[shown]/reveal:animate-swap-b";

// Positions point back at DINNERS, like the dots on the real grocery list.
const SHARED = [
  { name: "Cilantro", meals: [0, 2] },
  { name: "Rice", meals: [1, 2] },
  { name: "Lime", meals: [0, 2, 3] },
];

// Swaps wait for the entrance to finish.
const SWAP_STARTS = { animationDelay: "2.5s" };

/** A planned week, with the ingredients its dinners have in common. */
export function WeekPreview() {
  return (
    <Frame wash="bg-sage-soft">
      <FrameHeader title="This week">
        <Badge tone="sage">{DINNERS.length} dinners</Badge>
      </FrameHeader>
      <ul className="space-y-2.5">
        {DINNERS.map((dinner, index) => (
          <li
            key={dinner.title}
            className={cn(RISE, "flex items-center gap-3 rounded-2xl border px-3.5 py-3")}
            style={delay(250 + index * 110)}
          >
            <MealNumber position={index} />
            <span className="grid min-w-0 flex-1 text-sm font-medium sm:text-base">
              <span className={cn(STACKED, "truncate", dinner.swap && SWAP_A)} style={SWAP_STARTS}>
                {dinner.title}
              </span>
              {dinner.swap && (
                <span className={cn(STACKED, "truncate", SWAP_B)} style={SWAP_STARTS}>
                  {dinner.swap}
                </span>
              )}
            </span>
            <span className="hidden shrink-0 text-xs text-muted-foreground tabular-nums sm:inline">
              {dinner.minutes} min
            </span>
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground">
              <RefreshCw
                className={cn(
                  "size-3.5",
                  dinner.swap && "group-data-[shown]/reveal:animate-swap-turn",
                )}
                style={SWAP_STARTS}
              />
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-5 border-t pt-4">
        <p className="text-[0.6875rem] font-medium tracking-wider text-muted-foreground uppercase">
          Shared across the week
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {SHARED.map((item, index) => (
            <li
              key={item.name}
              className={cn(
                POP,
                "inline-flex items-center gap-1.5 rounded-full bg-secondary py-1 pr-1.5 pl-3 text-sm font-medium",
              )}
              style={delay(850 + index * 130)}
            >
              {item.name}
              {item.meals.map((position) => (
                <MealNumber key={position} position={position} size="sm" />
              ))}
            </li>
          ))}
        </ul>
      </div>
    </Frame>
  );
}

const PANTRY: { name: string; icon: LucideIcon; tile: string; state: string; tone: Tone }[] = [
  {
    name: "Olive oil",
    icon: Droplet,
    tile: "bg-saffron-soft text-saffron-ink",
    state: "Have",
    tone: "sage",
  },
  {
    name: "Rice",
    icon: Wheat,
    tile: "bg-saffron-soft text-saffron-ink",
    state: "Have",
    tone: "sage",
  },
  {
    name: "Eggs",
    icon: Egg,
    tile: "bg-sky-soft text-sky-ink",
    state: "Running low",
    tone: "saffron",
  },
  { name: "Milk", icon: Milk, tile: "bg-sky-soft text-sky-ink", state: "Out", tone: "tomato" },
  {
    name: "Carrots",
    icon: Carrot,
    tile: "bg-sage-soft text-sage-ink",
    state: "Unsure",
    tone: "plum",
  },
];

const CHECK_STARTS = { animationDelay: "2s", animationDuration: "7s" };

/** The kitchen, tracked loosely: have, running low, out, or unsure. */
export function PantryPreview() {
  return (
    <Frame wash="bg-saffron-soft">
      <FrameHeader title="Your kitchen">
        <Badge>No counting needed</Badge>
      </FrameHeader>
      <ul className="divide-y">
        {PANTRY.map((item, index) => (
          <li key={item.name} className="flex items-center gap-3 py-3 last:pb-0">
            <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", item.tile)}>
              <item.icon className="size-4.5" />
            </span>
            <span className="flex-1 font-medium">{item.name}</span>
            <span className={cn(POP, "grid justify-items-end")} style={delay(350 + index * 140)}>
              {/* The unsure item keeps getting checked at home and settled as "Have". */}
              <Badge
                tone={item.tone}
                className={cn(STACKED, item.state === "Unsure" && SWAP_A)}
                style={CHECK_STARTS}
              >
                {item.state === "Have" && <Check />}
                {item.state === "Unsure" && <CircleHelp />}
                {item.state}
              </Badge>
              {item.state === "Unsure" && (
                <Badge tone="sage" className={cn(STACKED, SWAP_B)} style={CHECK_STARTS}>
                  <Check />
                  Have
                </Badge>
              )}
            </span>
          </li>
        ))}
      </ul>
    </Frame>
  );
}

const PRODUCTS = [
  { name: "Cilantro", product: "Fresh cilantro, 1 bunch", price: 0.99 },
  { name: "Chicken thighs", product: "Boneless, skinless, 1 lb", price: 5.49 },
  { name: "Corn tortillas", product: "Street taco size, 24 ct", price: 2.79 },
  { name: "Limes", product: "3 medium", price: 1.47 },
];

// The total after each approval, starting from nothing. `animate-tally` rolls through
// five rows, so this needs four products.
const TOTALS = PRODUCTS.reduce((totals, item) => [...totals, totals.at(-1)! + item.price], [0]);

// Approvals land one after another; the total keeps pace.
const FIRST_TICK = 500;
const TICK_EVERY = 280;

/** A grocery list matched to store products, approved one by one, then sent to the cart. */
export function CartPreview() {
  return (
    <Frame wash="bg-sky-soft">
      <FrameHeader title="Groceries">
        <Badge tone="sky">Matched at your store</Badge>
      </FrameHeader>
      <ul className="divide-y">
        {PRODUCTS.map((item, index) => {
          const tick = delay(FIRST_TICK + index * TICK_EVERY);
          return (
            <li key={item.name} className="flex items-center gap-3.5 py-3">
              <span
                className="grid size-5 shrink-0 place-items-center rounded-md border-2 border-input bg-card transition-colors duration-300 group-data-[shown]/reveal:border-primary group-data-[shown]/reveal:bg-primary motion-reduce:transition-none"
                style={tick}
              >
                <Check
                  strokeWidth={3}
                  className="size-3.5 scale-0 text-primary-foreground transition-transform duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] group-data-[shown]/reveal:scale-100 motion-reduce:transition-none"
                  style={tick}
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{item.name}</span>
                <span className="block truncate text-xs text-muted-foreground">{item.product}</span>
              </span>
              <span className="shrink-0 font-medium text-primary tabular-nums">
                ${item.price.toFixed(2)}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="mt-2 flex items-center justify-between gap-3 border-t pt-4">
        <p>
          <span className="block text-xs text-muted-foreground">Total</span>
          <span className="block h-8 overflow-hidden font-display text-2xl leading-8 font-medium tabular-nums">
            <span
              className="flex flex-col group-data-[shown]/reveal:animate-tally"
              style={delay(FIRST_TICK)}
            >
              {TOTALS.map((total) => (
                <span key={total}>${total.toFixed(2)}</span>
              ))}
            </span>
          </span>
        </p>
        <span
          className={cn(
            POP,
            "inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/20",
          )}
          style={delay(FIRST_TICK + PRODUCTS.length * TICK_EVERY + 200)}
        >
          <ShoppingCart className="size-4" />
          Send to cart
        </span>
      </div>
    </Frame>
  );
}
