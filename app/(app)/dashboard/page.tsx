import { Clock, ShoppingBasket, UsersRound } from "lucide-react";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getMealPlan, getProfile, type MealPlan } from "@/lib/data";
import { DEFAULT_DINNERS_PER_WEEK, localDate } from "@/lib/meal-plan";
import { PlanWeekButton } from "./plan-week-button";

export const metadata: Metadata = {
  title: "Your week",
};

const weekOf = (weekStart: string) =>
  new Date(`${weekStart}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

export default async function DashboardPage() {
  const [{ displayName }, plan] = await Promise.all([
    getProfile(),
    getMealPlan(localDate(new Date())),
  ]);

  return (
    <div className="animate-fade-up">
      <h1 className="font-display text-4xl font-medium sm:text-5xl">
        Hi {displayName || "there"}.
      </h1>

      {plan ? (
        <>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
            <p className="text-lg text-muted-foreground">
              Your dinners for the week of {weekOf(plan.weekStart)}.
            </p>
            <PlanWeekButton hasPlan />
          </div>
          <Dinners meals={plan.meals} />
        </>
      ) : (
        <>
          <p className="mt-3 text-lg text-muted-foreground">
            We&apos;ll pick {DEFAULT_DINNERS_PER_WEEK} dinners around what you like and how many
            you&apos;re cooking for.
          </p>
          <div className="mt-8">
            <PlanWeekButton hasPlan={false} />
          </div>
        </>
      )}
    </div>
  );
}

function Dinners({ meals }: { meals: MealPlan["meals"] }) {
  return (
    <ul aria-label="Dinners this week" className="mt-8 grid gap-6 md:grid-cols-2">
      {meals.map((meal) => (
        <li key={meal.id}>
          <Card className="h-full">
            <CardHeader className="block">
              <CardTitle>{meal.title}</CardTitle>
              <CardDescription>{meal.summary}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
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
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
