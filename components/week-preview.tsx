import {
  Check,
  CookingPot,
  Drumstick,
  Fish,
  Leaf,
  Lock,
  Salad,
  ShoppingBasket,
  Soup,
  Timer,
  type LucideIcon,
} from "lucide-react";
import { FoodTile } from "@/components/food-tile";
import { PantryStateBadge } from "@/components/pantry-state-badge";
import { Badge, type Tone } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const SAMPLE_WEEK: {
  day: string;
  name: string;
  time: string;
  note: string;
  icon: LucideIcon;
  tone: Tone;
  locked?: boolean;
}[] = [
  { day: "Mon", name: "Lemon herb chicken & orzo", time: "35 min", note: "Uses spinach you have", icon: Drumstick, tone: "saffron", locked: true },
  { day: "Tue", name: "Miso-glazed salmon bowls", time: "25 min", note: "Shares cilantro with Fri", icon: Fish, tone: "sky" },
  { day: "Wed", name: "Leftovers night", time: "5 min", note: "Monday's chicken, round two", icon: CookingPot, tone: "neutral" },
  { day: "Thu", name: "Tomato soup & grilled cheese", time: "30 min", note: "Pantry-friendly", icon: Soup, tone: "tomato" },
  { day: "Fri", name: "Crispy chickpea fajita salad", time: "20 min", note: "Finishes the cilantro", icon: Salad, tone: "sage" },
];

/** Illustrative product mockup for marketing surfaces. Not real data. */
export function WeekPreview({
  className,
  floating = true,
}: {
  className?: string;
  floating?: boolean;
}) {
  return (
    <div className={cn("relative", className)} aria-hidden>
      <div className="relative rounded-[1.75rem] border bg-card p-5 shadow-[0_40px_80px_-40px_rgba(28,41,32,0.45)]">
        <div className="flex items-start justify-between gap-4 px-1">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
              This week
            </p>
            <p className="font-display text-xl font-medium">5 dinners for 2</p>
          </div>
          <Badge tone="sage">
            <Check strokeWidth={3} />
            Plan approved
          </Badge>
        </div>

        <ul className="mt-4 space-y-0.5">
          {SAMPLE_WEEK.map((meal) => (
            <li
              key={meal.day}
              className="flex items-center gap-3 rounded-2xl px-1 py-2"
            >
              <span className="w-8 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                {meal.day}
              </span>
              <FoodTile icon={meal.icon} tone={meal.tone} className="size-10 rounded-xl" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{meal.name}</p>
                <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                  <Timer className="size-3" />
                  {meal.time}
                  <span className="text-border">•</span>
                  <span className="truncate text-sage-ink">{meal.note}</span>
                </p>
              </div>
              {meal.locked && <Lock className="size-3.5 text-muted-foreground" />}
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-primary px-4 py-3 text-primary-foreground">
          <div className="flex items-center gap-3">
            <ShoppingBasket className="size-5 text-saffron" />
            <div>
              <p className="text-sm font-medium">Grocery list ready</p>
              <p className="text-xs text-primary-foreground/70">
                18 items · 6 already at home
              </p>
            </div>
          </div>
          <span className="rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-medium">
            Review
          </span>
        </div>
      </div>

      {floating && (
        <>
          <div className="absolute -bottom-36 -left-14 hidden w-60 -rotate-3 animate-float rounded-2xl border bg-card p-4 shadow-xl shadow-foreground/5 sm:block">
            <p className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
              Kitchen check
            </p>
            <ul className="mt-3 space-y-2.5 text-sm">
              <li className="flex items-center justify-between">
                Garlic <PantryStateBadge state="low" />
              </li>
              <li className="flex items-center justify-between">
                Spinach <PantryStateBadge state="have" />
              </li>
              <li className="flex items-center justify-between">
                Parmesan <PantryStateBadge state="unsure" />
              </li>
            </ul>
          </div>

          <div className="absolute -top-14 -right-4 hidden rotate-3 animate-float items-center gap-3 rounded-2xl border bg-card py-3 pr-5 pl-3 shadow-lg shadow-foreground/5 [animation-delay:-3s] sm:flex">
            <FoodTile icon={Leaf} tone="sage" className="size-9 rounded-xl" />
            <div>
              <p className="text-sm font-medium">Cilantro, used twice</p>
              <p className="text-xs text-muted-foreground">Tue bowls → Fri salad</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
