import { RotateCcw } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { isDev } from "@/lib/dev";
import { restartOnboarding } from "./actions";
import { RestartButton } from "./restart-button";

export const metadata: Metadata = {
  title: "Admin",
};

const card =
  "rounded-3xl border bg-card p-5 shadow-[0_1px_2px_rgba(28,41,32,0.04),0_8px_24px_-12px_rgba(28,41,32,0.08)] sm:p-6";

// Tools for testing the app locally. Hidden from the tabs and a 404 outside `next dev`.
export default function AdminSettingsPage() {
  if (!isDev) notFound();

  return (
    <section aria-labelledby="onboarding-heading">
      <div className="flex items-center gap-2">
        <h2 id="onboarding-heading" className="text-base font-semibold">
          Onboarding
        </h2>
        <Badge tone="saffron">Local dev only</Badge>
      </div>
      <p className="mt-0.5 mb-4 text-sm text-muted-foreground">
        Go through first-time setup again on this account.
      </p>
      <form action={restartOnboarding} className={card}>
        <div className="flex items-start gap-4">
          <span
            aria-hidden
            className="grid size-11 shrink-0 place-items-center rounded-2xl bg-saffron-soft text-saffron-ink"
          >
            <RotateCcw className="size-5" />
          </span>
          <div className="space-y-4">
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">Restart</span> keeps your answers, so
                each step opens filled in.
              </li>
              <li>
                <span className="font-medium text-foreground">Start fresh</span> clears your food
                preferences and meal plans and resets your household, like a new account.
              </li>
            </ul>
            <div className="flex flex-wrap gap-2">
              <RestartButton intent="keep">Restart onboarding</RestartButton>
              <RestartButton intent="fresh" variant="outline">
                Start fresh
              </RestartButton>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}
