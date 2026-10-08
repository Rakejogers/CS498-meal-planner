import type { Metadata } from "next";
import { getFoodPreferences } from "@/lib/data";
import { PreferencesForm } from "./preferences-form";

export const metadata: Metadata = {
  title: "Food preferences",
};

export default async function PreferencesSettingsPage() {
  const preferences = await getFoodPreferences();

  return <PreferencesForm initial={preferences} />;
}
