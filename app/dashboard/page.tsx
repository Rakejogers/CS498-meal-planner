import {
  CalendarDays,
  CalendarPlus,
  Check,
  ChefHat,
  CookingPot,
  Drumstick,
  Fish,
  Leaf,
  ListChecks,
  PartyPopper,
  Pizza,
  Refrigerator,
  Salad,
  ShoppingCart,
  SlidersHorizontal,
  Soup,
  Store,
  Timer,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { FoodTile } from "@/components/food-tile";
import { PantryStateBadge } from "@/components/pantry-state-badge";
import { Badge, type Tone } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getHousehold, type HouseholdData } from "@/lib/data";
import {
  BUDGETS,
  COOK_TIMES,
  COOKING_CONFIDENCE,
  DIETARY_RESTRICTIONS,
  LEFTOVERS,
} from "@/lib/onboarding";
import { cn, sentenceCase } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Your week",
};

const PLACEHOLDER_MEALS: { icon: LucideIcon; tone: Tone }[] = [
  { icon: Drumstick, tone: "saffron" },
  { icon: Fish, tone: "sky" },
  { icon: Soup, tone: "tomato" },
  { icon: Salad, tone: "sage" },
  { icon: Pizza, tone: "plum" },
  { icon: CookingPot, tone: "saffron" },
  { icon: Leaf, tone: "sage" },
];

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const [data, params] = await Promise.all([getHousehold(), searchParams]);
  if (!data.profile.onboarded_at) redirect("/onboarding");

  const firstName = data.profile.display_name || "there";

  return (
    <div className="space-y-10">
      {params.welcome === "1" && <WelcomeBanner name={firstName} />}

      <div className="flex flex-wrap items-end justify-between gap-6 animate-fade-up">
        <div>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="size-4" />
            Week of {weekOf(new Date())}
          </p>
          <h1 className="mt-2 font-display text-4xl font-medium sm:text-5xl">
            Hi {firstName}, let&apos;s plan your week.
          </h1>
        </div>
        <Link href="/onboarding" className={buttonVariants({ variant: "outline", size: "sm" })}>
          <SlidersHorizontal />
          Edit preferences
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ThisWeekCard data={data} />
          <WeeklyRhythmCard />
          <StoreCard />
        </div>
        <div className="space-y-6">
          <HouseholdCard data={data} />
          <KitchenCard data={data} />
        </div>
      </div>
    </div>
  );
}

function WelcomeBanner({ name }: { name: string }) {
  return (
    <div className="flex animate-fade-up items-center gap-4 rounded-3xl border border-sage/20 bg-sage-soft px-5 py-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-card text-sage-ink shadow-xs">
        <PartyPopper className="size-5" />
      </span>
      <div>
        <p className="font-medium text-sage-ink">You&apos;re all set, {name}.</p>
        <p className="text-sm text-sage-ink/80">
          Your household and kitchen are saved. Next up: your first weekly plan.
        </p>
      </div>
    </div>
  );
}

function ThisWeekCard({ data }: { data: HouseholdData }) {
  const { household, preferences, pantry } = data;
  const useSoon = pantry.filter((item) => item.use_soon).map((item) => item.name);
  const stapleCount = pantry.filter((item) => item.is_staple).length;

  return (
    <Card>
      <CardHeader className="flex-wrap">
        <div>
          <CardTitle>This week&apos;s dinners</CardTitle>
          <CardDescription>
            {household.dinners_per_week} {plural(household.dinners_per_week, "dinner")} for{" "}
            {household.size} · up to {preferences.max_cook_minutes} min each
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="saffron">Coming soon</Badge>
          <Button size="sm" disabled>
            <CalendarPlus />
            Plan my week
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: household.dinners_per_week }, (_, i) => {
            const meal = PLACEHOLDER_MEALS[i % PLACEHOLDER_MEALS.length];
            return (
              <li
                key={i}
                className="flex items-center gap-4 rounded-2xl border border-dashed bg-background/60 p-4"
              >
                <FoodTile icon={meal.icon} tone={meal.tone} className="opacity-70" />
                <div>
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Dinner {i + 1}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">Waiting for your first plan</p>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-5 flex items-start gap-2 text-sm text-muted-foreground">
          <Leaf className="mt-0.5 size-4 shrink-0 text-sage-ink" />
          {useSoon.length > 0
            ? `Your first plan will try to use up ${listFormat(useSoon)}.`
            : `Your first plan will build around your ${stapleCount} kitchen ${plural(stapleCount, "staple")}.`}
        </p>
      </CardContent>
    </Card>
  );
}

const RHYTHM: { label: string; description: string; icon: LucideIcon }[] = [
  { label: "Set preferences", description: "Household, tastes, routine", icon: SlidersHorizontal },
  { label: "Plan dinners", description: "Swap, lock, or skip nights", icon: CalendarDays },
  { label: "Check kitchen", description: "Confirm anything unsure", icon: Refrigerator },
  { label: "Review groceries", description: "One combined list", icon: ListChecks },
  { label: "Send to Kroger", description: "Approve, then check out", icon: ShoppingCart },
];

function WeeklyRhythmCard() {
  const completed = 1;

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Your weekly rhythm</CardTitle>
          <CardDescription>
            A few minutes each week, from plan to cart. You approve every step.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ol className="grid gap-4 sm:grid-cols-5">
          {RHYTHM.map((step, index) => {
            const done = index < completed;
            const next = index === completed;
            const Icon = done ? Check : step.icon;
            return (
              <li key={step.label} className="relative flex gap-3 sm:flex-col">
                {index < RHYTHM.length - 1 && (
                  <span
                    className={cn(
                      "absolute top-5 left-[calc(2.5rem+0.5rem)] hidden h-px w-[calc(100%-2.5rem)] sm:block",
                      done ? "bg-primary" : "bg-border",
                    )}
                    aria-hidden
                  />
                )}
                <span
                  className={cn(
                    "relative grid size-10 shrink-0 place-items-center rounded-full border",
                    done && "border-primary bg-primary text-primary-foreground",
                    next && "border-primary/40 bg-sage-soft text-sage-ink ring-4 ring-sage-soft/60",
                    !done && !next && "bg-card text-muted-foreground",
                  )}
                >
                  <Icon className="size-4" strokeWidth={done ? 3 : 2} />
                </span>
                <div>
                  <p className={cn("text-sm font-medium", !done && !next && "text-muted-foreground")}>
                    {step.label}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {next ? <span className="font-medium text-sage-ink">Up next</span> : step.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}

function HouseholdCard({ data }: { data: HouseholdData }) {
  const { household, preferences } = data;
  const label = <T extends { value: string | number; label: string }>(
    options: readonly T[],
    value: string | number,
  ) => options.find((option) => option.value === value)?.label ?? String(value);

  const restrictions = preferences.dietary_restrictions.map((value) =>
    label(DIETARY_RESTRICTIONS, value),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your household</CardTitle>
        <Link href="/onboarding" className="text-sm font-medium text-primary hover:underline">
          Edit
        </Link>
      </CardHeader>
      <CardContent className="space-y-6">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
          <Stat icon={Users} label="Cooking for">
            {household.size} {plural(household.size, "person", "people")}
          </Stat>
          <Stat icon={CalendarDays} label="Dinners">
            {household.dinners_per_week} a week
          </Stat>
          <Stat icon={Timer} label="Time">
            {label(COOK_TIMES, preferences.max_cook_minutes)}
          </Stat>
          <Stat icon={Wallet} label="Budget">
            {label(BUDGETS, preferences.budget)}
          </Stat>
          <Stat icon={ChefHat} label="Style">
            {label(COOKING_CONFIDENCE, preferences.cooking_confidence)}
          </Stat>
          <Stat icon={CookingPot} label="Leftovers">
            {label(LEFTOVERS, preferences.leftovers)}
          </Stat>
        </dl>

        <TagGroup
          title="Loves"
          empty="Open to anything"
          tags={preferences.cuisines.map((c) => ({ label: c, tone: "sage" as const }))}
        />
        <TagGroup
          title="Avoids"
          empty="No restrictions"
          tags={[
            ...restrictions.map((r) => ({ label: r, tone: "plum" as const })),
            ...preferences.dislikes.map((d) => ({ label: sentenceCase(d), tone: "tomato" as const })),
          ]}
        />
      </CardContent>
    </Card>
  );
}

function KitchenCard({ data }: { data: HouseholdData }) {
  const staples = data.pantry.filter((item) => item.is_staple);
  const useSoon = data.pantry.filter((item) => item.use_soon);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Your kitchen</CardTitle>
          <CardDescription>
            {staples.length} {plural(staples.length, "staple")} usually on hand
          </CardDescription>
        </div>
        <FoodTile icon={Refrigerator} tone="sky" className="size-10 rounded-xl" />
      </CardHeader>
      <CardContent className="space-y-5">
        {useSoon.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold tracking-[0.12em] text-saffron-ink uppercase">
              Use soon
            </p>
            <div className="flex flex-wrap gap-1.5">
              {useSoon.map((item) => (
                <Badge key={item.name} tone="saffron" className="px-3 py-1 text-sm">
                  {sentenceCase(item.name)}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {staples.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5">
            {staples.map((item) => (
              <li
                key={item.name}
                className="flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-sm"
              >
                {sentenceCase(item.name)}
                {item.state !== "have" && <PantryStateBadge state={item.state} />}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            No staples yet. Add a few so plans can lean on what you have.
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Before each shop, you&apos;ll get a quick check on anything uncertain.
        </p>
      </CardContent>
    </Card>
  );
}

function StoreCard() {
  return (
    <Card>
      <CardContent className="flex items-start gap-4">
        <FoodTile icon={Store} tone="plum" />
        <div className="space-y-3">
          <div>
            <p className="font-medium">Connect your store</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Link Kroger when you&apos;re ready to shop. We&apos;ll match your list to
              real products before anything reaches your cart.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Connect Kroger
            </Button>
            <Badge tone="saffron">Coming soon</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="font-medium">{children}</dd>
      </div>
    </div>
  );
}

function TagGroup({
  title,
  empty,
  tags,
}: {
  title: string;
  empty: string;
  tags: { label: string; tone: Tone }[];
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
        {title}
      </p>
      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge key={`${tag.tone}-${tag.label}`} tone={tag.tone} className="px-3 py-1 text-sm">
              {tag.label}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{empty}</p>
      )}
    </div>
  );
}

function weekOf(date: Date) {
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return monday.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

function plural(count: number, singular: string, pluralForm = `${singular}s`) {
  return count === 1 ? singular : pluralForm;
}

function listFormat(items: string[]) {
  return new Intl.ListFormat("en-US", { style: "long", type: "conjunction" }).format(items);
}
