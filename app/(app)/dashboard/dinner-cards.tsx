import { Clock, ShoppingBasket, UsersRound } from "lucide-react";
import Link from "next/link";
import { MealNumber } from "@/components/meal-number";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { MealPlan } from "@/lib/data";

const GRID = "mt-8 grid gap-5 md:grid-cols-2";

// Cards arrive one after another rather than all at once.
const stagger = (index: number) => ({ animationDelay: `${index * 70}ms` });

export function Dinners({ meals }: { meals: MealPlan["meals"] }) {
  return (
    <ul aria-label="Dinners this week" className={GRID}>
      {meals.map((meal, index) => (
        // Keyed by id, so a new plan's cards play their entrance again.
        <li key={meal.id} className="animate-fade-up" style={stagger(index)}>
          {/* The title's link covers the card, so the whole card opens the recipe. */}
          <Card className="relative flex h-full flex-col p-6 transition-[translate,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(28,41,32,0.05),0_16px_32px_-16px_rgba(28,41,32,0.18)] has-[a:focus-visible]:ring-4 has-[a:focus-visible]:ring-ring/20">
            <div className="flex items-start gap-4">
              <MealNumber position={index} />
              <div className="min-w-0">
                <h2 className="font-display text-xl font-medium wrap-anywhere">
                  {/* Prefetch the whole recipe so it opens without a loading state. */}
                  <Link
                    href={`/meals/${meal.id}`}
                    prefetch
                    className="outline-none after:absolute after:inset-0 after:rounded-3xl"
                  >
                    {meal.title}
                  </Link>
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {meal.summary}
                </p>
              </div>
            </div>
            <div className="mt-auto flex flex-wrap gap-2 pt-5 pl-12">
              <Badge tone="saffron">
                <Clock aria-hidden />
                {meal.totalMinutes} min
              </Badge>
              <Badge tone="sky">
                <UsersRound aria-hidden />
                Serves {meal.servings}
              </Badge>
              <Badge tone="sage">
                <ShoppingBasket aria-hidden />
                {meal.ingredients.length} ingredients
              </Badge>
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}

/** Stand-ins shaped like dinner cards, for while a plan loads or is being made. */
export function DinnerSkeletons({ count }: { count: number }) {
  return (
    <div aria-hidden className={GRID}>
      {Array.from({ length: count }, (_, index) => (
        <Card key={index} className="animate-fade-up p-6" style={stagger(index)}>
          <div className="flex items-start gap-4">
            <Skeleton className="size-8 shrink-0 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-6 w-3/5 rounded-lg" />
              <Skeleton className="mt-3 h-3.5 w-full rounded-md" />
              <Skeleton className="mt-2 h-3.5 w-4/5 rounded-md" />
            </div>
          </div>
          <div className="mt-5 flex gap-2 pl-12">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </Card>
      ))}
    </div>
  );
}
