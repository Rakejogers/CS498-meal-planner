import type { Metadata } from "next";
import { getMealPlan, getProfile } from "@/lib/data";
import { localDate } from "@/lib/meal-plan";
import { WeekPlan } from "./week-plan";

export const metadata: Metadata = {
  title: "Your week",
};

export default async function DashboardPage() {
  const [{ displayName, mealsPerWeek }, plan] = await Promise.all([
    getProfile(),
    getMealPlan(localDate(new Date())),
  ]);

  return (
    <div className="animate-fade-up">
      <h1 className="font-display text-4xl font-medium sm:text-5xl">
        Hi {displayName || "there"}.
      </h1>
      <WeekPlan plan={plan} mealsPerWeek={mealsPerWeek} />
    </div>
  );
}
