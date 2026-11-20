import { ArrowRight, ShoppingBasket } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getMealPlan, getProfile } from "@/lib/data";
import { combineGroceries } from "@/lib/groceries";
import { isKrogerConfigured } from "@/lib/kroger/client";
import { matchGroceries } from "@/lib/kroger/match";
import { isKrogerConnected } from "@/lib/kroger/session";
import { formatWeekOf, localDate } from "@/lib/meal-plan";
import { GroceryList } from "./grocery-list";

export const metadata: Metadata = { title: "Groceries" };

// Everything the week's dinners call for, in one list. It follows the meal
// plan, so planning new dinners changes it too.
export default async function GroceriesPage() {
  const [plan, { krogerStore }, connected] = await Promise.all([
    getMealPlan(localDate(new Date())),
    getProfile(),
    isKrogerConnected(),
  ]);
  const cooked = plan?.meals.filter((meal) => meal.countsForGroceries) ?? [];
  const dinners = cooked.reduce((sum, meal) => sum + meal.nights, 0);
  const items = plan ? combineGroceries(plan.meals) : [];
  const matches =
    plan && krogerStore && isKrogerConfigured()
      ? await matchGroceries(
          items.map((item) => item.name),
          krogerStore.locationId,
        ).catch((error: unknown) => {
          console.error(
            "Grocery product search failed:",
            error instanceof Error ? error.message : error,
          );
          return items.map((item) => ({ name: item.name, product: null }));
        })
      : null;

  return (
    <div className="animate-fade-up">
      <h1 className="font-display text-4xl font-medium sm:text-5xl">Your grocery list</h1>
      {plan ? (
        <>
          <p className="mt-3 max-w-xl text-lg text-muted-foreground">
            {dinners > cooked.length
              ? `Everything for your ${dinners} dinners, from ${cooked.length} ${cooked.length === 1 ? "cook" : "cooks"}, the week of ${formatWeekOf(plan.weekStart)}.`
              : `Everything for your ${plan.meals.length} ${plan.meals.length === 1 ? "dinner" : "dinners"} the week of ${formatWeekOf(plan.weekStart)}.`}
          </p>
          <GroceryList
            planId={plan.id}
            meals={plan.meals.map((meal) => meal.title)}
            items={items}
            matches={matches}
            krogerConnected={connected}
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
