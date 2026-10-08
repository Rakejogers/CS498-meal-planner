import { LogOut } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { APP_HOME } from "@/lib/auth";
import { getFoodPreferences, getProfile } from "@/lib/data";
import { OnboardingForm } from "./onboarding-form";

export const metadata: Metadata = {
  title: "Welcome",
};

// First-time setup. The signed-in layout sends new accounts here until they
// finish or skip it; afterwards the same questions live in Settings.
export default async function OnboardingPage() {
  const [{ displayName, onboarded }, preferences] = await Promise.all([
    getProfile(),
    getFoodPreferences(),
  ]);
  if (onboarded) redirect(APP_HOME);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <Logo />
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="ghost" size="sm" className="text-muted-foreground">
              <LogOut />
              Sign out
            </Button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 animate-fade-up px-6 pt-10">
        <p className="text-xs font-semibold tracking-widest text-sage-ink uppercase">
          Welcome{displayName ? `, ${displayName}` : ""}
        </p>
        <h1 className="mt-3 font-display text-4xl font-medium sm:text-5xl">
          What do you like to eat?
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Tell us what works for you and we&apos;ll plan dinners around it. You can change these
          anytime in Settings.
        </p>

        <OnboardingForm initial={preferences} />
      </main>
    </div>
  );
}
