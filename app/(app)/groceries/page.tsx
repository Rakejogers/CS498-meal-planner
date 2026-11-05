import { ArrowRight, ShoppingBasket } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getMealPlan } from "@/lib/data";
import { combineGroceries } from "@/lib/groceries";
import { formatWeekOf, localDate } from "@/lib/meal-plan";
import { GroceryList } from "./grocery-list";

export const metadata: Metadata = { title: "Groceries" };

// Everything the week's dinners call for, in one list. It follows the meal
// plan, so planning new dinners changes it too.
export default async function GroceriesPage() {
  const plan = await getMealPlan(localDate(new Date()));

  return (
    <div className="animate-fade-up">
      <h1 className="font-display text-4xl font-medium sm:text-5xl">Your grocery list</h1>
      {plan ? (
        <>
          <p className="mt-3 max-w-xl text-lg text-muted-foreground">
            Everything for your {plan.meals.length} {plan.meals.length === 1 ? "dinner" : "dinners"}{" "}
            the week of {formatWeekOf(plan.weekStart)}.
          </p>
          <GroceryList
            planId={plan.id}
            meals={plan.meals.map((meal) => meal.title)}
            items={combineGroceries(plan.meals)}
          />
        </>
      ) : (
        <Card className="mt-9 flex max-w-3xl flex-col items-start gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-3xl bg-sage-soft text-sage-ink">
            <ShoppingBasket className="size-7" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-2xl font-medium">Plan your week first.</h2>
            <p className="mt-2 max-w-lg leading-relaxed text-muted-foreground">
              Once you have dinners planned, everything they need shows up here as one list.
            </p>
          </div>
          <Link href="/dashboard" className={buttonVariants()}>
            Plan my week <ArrowRight aria-hidden="true" />
          </Link>
        </Card>
      )}
    </div>
  );
}
