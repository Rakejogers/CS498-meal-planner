import type { Metadata } from "next";
import { getProfile } from "@/lib/data";
import { HouseholdForm } from "./household-form";

export const metadata: Metadata = {
  title: "Household",
};

export default async function HouseholdSettingsPage() {
  const { householdSize, mealsPerWeek, cookingDays } = await getProfile();

  return <HouseholdForm initial={{ householdSize, mealsPerWeek, cookingDays }} />;
}
