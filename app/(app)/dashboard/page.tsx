import type { Metadata } from "next";
import { ArrowRight, ShoppingBasket } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
        A little planning now, easier dinners all week.
      </p>
      <Card className="mt-9 flex flex-col items-start gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-3xl bg-sage-soft text-sage-ink">
          <ShoppingBasket className="size-7" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h2 className="font-display text-2xl font-medium">Bring your dinners together.</h2>
          <p className="mt-2 max-w-lg leading-relaxed text-muted-foreground">
            Have a few meals in mind? Gather their ingredients in one grocery list, sized for your
            household.
          </p>
        </div>
        <Link href="/groceries" className={buttonVariants()}>
          Build my grocery list <ArrowRight aria-hidden="true" />
        </Link>
      </Card>
    </div>
  );
}
