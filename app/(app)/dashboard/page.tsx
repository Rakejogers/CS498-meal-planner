import type { Metadata } from "next";
import { getProfile } from "@/lib/data";

export const metadata: Metadata = {
  title: "Your week",
};

export default async function DashboardPage() {
  const { displayName } = await getProfile();

  return (
    <div className="animate-fade-up">
      <h1 className="font-display text-4xl font-medium sm:text-5xl">
        Hi {displayName || "there"}.
      </h1>
      <p className="mt-3 text-lg text-muted-foreground">
        You&apos;re signed in. Your week of dinners will show up here.
      </p>
    </div>
  );
}
