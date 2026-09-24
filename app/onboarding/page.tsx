import type { Metadata } from "next";
import { getHousehold } from "@/lib/data";
import {
  CUISINES,
  DEFAULT_STAPLES,
  DIETARY_VALUES,
  onlyKnown,
  STAPLES,
  type OnboardingInput,
} from "@/lib/onboarding";
import { OnboardingFlow } from "./onboarding-flow";

export const metadata: Metadata = {
  title: "Set up your kitchen",
};

export default async function OnboardingPage() {
  const { profile, household, preferences, pantry } = await getHousehold();
  const isEditing = Boolean(profile.onboarded_at);

  const initial: OnboardingInput = {
    displayName: profile.display_name ?? "",
    householdSize: household.size,
    dinnersPerWeek: household.dinners_per_week,
    cuisines: onlyKnown(preferences.cuisines, CUISINES),
    dietaryRestrictions: onlyKnown(preferences.dietary_restrictions, DIETARY_VALUES),
    dislikes: preferences.dislikes,
    maxCookMinutes: preferences.max_cook_minutes,
    cookingConfidence: preferences.cooking_confidence,
    leftovers: preferences.leftovers,
    budget: preferences.budget,
    staples: isEditing
      ? onlyKnown(
          pantry.filter((item) => item.is_staple).map((item) => item.name),
          STAPLES,
        )
      : DEFAULT_STAPLES,
    useSoon: pantry.filter((item) => item.use_soon).map((item) => item.name),
  };

  return <OnboardingFlow initial={initial} isEditing={isEditing} />;
}
