import { ArrowLeft, Clock, ShoppingBasket, UsersRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MealNumber } from "@/components/meal-number";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getPlannedMeal } from "@/lib/data";
import { formatGroceryAmount } from "@/lib/groceries";
import { formatWeekOf } from "@/lib/meal-plan";
import { cn, sentenceCase } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/meals/[id]">): Promise<Metadata> {
  const meal = await getPlannedMeal((await params).id);
  return { title: meal?.title ?? "Dinner not found" };
}

// One planned dinner's full recipe: what to buy and how to cook it.
export default async function MealPage({ params }: PageProps<"/meals/[id]">) {
  const meal = await getPlannedMeal((await params).id);
  if (!meal) notFound();

  return (
    <article className="animate-fade-up">
      <Link
        href="/dashboard"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "-ml-3 text-muted-foreground",
        )}
      >
        <ArrowLeft aria-hidden="true" /> Your week
      </Link>

      <header className="mt-6 max-w-3xl">
        <p className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground">
          <MealNumber position={meal.position} size="sm" />
          Dinner {meal.position + 1} · Week of {formatWeekOf(meal.weekStart)}
        </p>
        <h1 className="mt-3 font-display text-4xl font-medium wrap-anywhere sm:text-5xl">
          {meal.title}
        </h1>
        {meal.summary && (
          <p className="mt-3 text-lg leading-relaxed text-muted-foreground">{meal.summary}</p>
        )}
        <div className="mt-5 flex flex-wrap gap-2">
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
      </header>

      <div className="mt-10 grid items-start gap-10 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <section aria-labelledby="ingredients" className="lg:sticky lg:top-24">
          <h2 id="ingredients" className="font-display text-2xl font-medium">
            Ingredients
          </h2>
          <Card className="mt-4 overflow-hidden">
            <ul aria-labelledby="ingredients" className="divide-y">
              {meal.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-baseline gap-4 px-5 py-3.5">
                  <span className="min-w-0 flex-1 font-medium wrap-anywhere">
                    {sentenceCase(ingredient.name)}
                  </span>
                  <span className="shrink-0 text-right font-medium text-primary tabular-nums">
                    {formatGroceryAmount(ingredient)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <section aria-labelledby="steps" className="max-w-2xl">
          <h2 id="steps" className="font-display text-2xl font-medium">
            Steps
          </h2>
          <ol aria-labelledby="steps" className="mt-4 space-y-6">
            {meal.steps.map((step, index) => (
              <li key={index} className="flex gap-4">
                <span
                  aria-hidden
                  className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary font-display text-sm font-medium tabular-nums"
                >
                  {index + 1}
                </span>
                <p className="pt-1 leading-relaxed wrap-anywhere">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </article>
  );
}
