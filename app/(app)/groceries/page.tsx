import { UsersRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getGroceryMeals, getProfile } from "@/lib/data";
import { combineGroceries } from "@/lib/groceries";
import { cn } from "@/lib/utils";
import { GroceryList } from "./grocery-list";
import { MealCard } from "./meal-card";
import { AddMealCard } from "./meal-form";

export const metadata: Metadata = { title: "Groceries" };

export default async function GroceriesPage() {
  const [profile, meals] = await Promise.all([getProfile(), getGroceryMeals()]);
  const items = combineGroceries(meals);
  const includedCount = meals.filter((meal) => meal.included).length;
  return (
    <div className="animate-fade-up">
      <div className="mb-9 flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="font-display text-4xl font-medium sm:text-5xl">Your grocery list</h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
            A week of dinners. One list to shop. Add the meals you have in mind, and we&apos;ll
            bring the ingredients together.
          </p>
        </div>
        <Link
          href="/settings/household"
          className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2.5 text-sm text-primary outline-none hover:bg-secondary focus-visible:ring-4 focus-visible:ring-ring/20"
        >
          <UsersRound className="size-4" aria-hidden="true" /> Household of {profile.householdSize}
        </Link>
      </div>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <section aria-labelledby="meals-heading" className="min-w-0 space-y-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="meals-heading" className="font-display text-2xl font-medium">
              Meals to shop for
            </h2>
            <span className="text-sm text-muted-foreground">{includedCount} included</span>
          </div>
          {meals.map((meal) => (
            <MealCard key={meal.id} meal={meal} householdSize={profile.householdSize} />
          ))}
          <AddMealCard householdSize={profile.householdSize} initiallyOpen={meals.length === 0} />
          <p className="px-1 text-xs leading-relaxed text-muted-foreground">
            Meals are saved to your account. Change the servings or leave a meal out anytime; your
            list updates with it.
          </p>
        </section>
        <section
          aria-label="Grocery list"
          className={cn(
            "min-w-0 lg:sticky lg:top-24",
            items.length > 0 && "order-first lg:order-last",
          )}
        >
          <GroceryList key={JSON.stringify(items)} items={items} mealCount={includedCount} />
        </section>
      </div>
    </div>
  );
}
