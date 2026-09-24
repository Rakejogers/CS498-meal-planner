import {
  ArrowRight,
  CalendarDays,
  Check,
  ChefHat,
  Leaf,
  ListChecks,
  Refrigerator,
  ShieldCheck,
  ShoppingBasket,
  Sprout,
  Timer,
  Users,
} from "lucide-react";
import Link from "next/link";
import { FoodTile } from "@/components/food-tile";
import { Logo } from "@/components/logo";
import { PantryStateBadge } from "@/components/pantry-state-badge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { WeekPreview } from "@/components/week-preview";
import { getUser } from "@/lib/data";
import { cn } from "@/lib/utils";

export default async function Home() {
  const user = await getUser();
  const primaryHref = user ? "/dashboard" : "/login?mode=signup";

  return (
    <div className="relative overflow-x-clip">
      <SiteHeader signedIn={Boolean(user)} />
      <main>
        <Hero primaryHref={primaryHref} signedIn={Boolean(user)} />
        <HowItWorks />
        <Features />
        <ClosingCta primaryHref={primaryHref} signedIn={Boolean(user)} />
      </main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-transparent bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-6">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#how-it-works" className="transition-colors hover:text-foreground">
            How it works
          </a>
          <a href="#features" className="transition-colors hover:text-foreground">
            Features
          </a>
        </nav>
        <div className="flex items-center gap-2">
          {signedIn ? (
            <Link href="/dashboard" className={buttonVariants({ size: "sm" })}>
              Open dashboard
              <ArrowRight />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Log in
              </Link>
              <Link
                href="/login?mode=signup"
                className={buttonVariants({ size: "sm" })}
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function Hero({ primaryHref, signedIn }: { primaryHref: string; signedIn: boolean }) {
  return (
    <section className="relative">
      {/* Soft color washes behind the hero */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute -top-40 right-[-10%] size-[42rem] rounded-full bg-saffron-soft/80 blur-3xl" />
        <div className="absolute top-40 right-[20%] size-[26rem] rounded-full bg-sage-soft blur-3xl" />
        <div className="absolute -left-40 top-10 size-[28rem] rounded-full bg-tomato-soft/50 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-20 px-6 pt-12 pb-28 lg:grid-cols-[1.05fr_1fr] lg:pt-20 lg:pb-36">
        <div className="animate-fade-up">
          <Badge tone="sage" className="px-3 py-1 text-[13px]">
            <Sprout className="!size-3.5" />
            Weekly dinners, without the weekly planning
          </Badge>
          <h1 className="mt-6 font-display text-5xl leading-[1.02] font-medium sm:text-6xl lg:text-[4.5rem]">
            Dinner,{" "}
            <em className="font-normal text-primary italic">sorted</em>
            <br />
            for the whole week.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Plenly plans a week of dinners around what you like and what&apos;s
            already in your kitchen, then turns it into one tidy grocery list,
            ready for your cart.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href={primaryHref} className={buttonVariants({ size: "lg" })}>
              {signedIn ? "Go to my week" : "Plan my first week"}
              <ArrowRight />
            </Link>
            <a
              href="#how-it-works"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              See how it works
            </a>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
            {[
              "3–5 dinners a week",
              "Uses what you already have",
              "You approve everything",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="grid size-5 place-items-center rounded-full bg-sage-soft text-sage-ink">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <WeekPreview className="mx-auto w-full max-w-md animate-fade-up [animation-delay:120ms] lg:mr-0" />
      </div>
    </section>
  );
}

const STEPS = [
  {
    icon: ChefHat,
    tone: "saffron",
    title: "Tell us how you eat",
    body: "Household size, favorite cuisines, foods to skip, and how long you like to spend at the stove.",
  },
  {
    icon: CalendarDays,
    tone: "sage",
    title: "Get a week of dinners",
    body: "A plan built as a whole week. Swap a meal, lock the ones you love, or call a leftovers night.",
  },
  {
    icon: Refrigerator,
    tone: "sky",
    title: "Check your kitchen",
    body: "Quickly confirm what you have. Approximate is fine: have, running low, out, or not sure.",
  },
  {
    icon: ShoppingBasket,
    tone: "tomato",
    title: "Fill your cart",
    body: "One combined list, matched to real products at your store and sent to your cart when you say so.",
  },
] as const;

function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-y bg-card/60">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <SectionHeading
          eyebrow="How it works"
          title="From “what's for dinner?” to groceries in a few minutes."
        />
        <ol className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="relative rounded-3xl border bg-card p-6 shadow-[0_1px_2px_rgba(28,41,32,0.04)]"
            >
              <div className="flex items-center justify-between">
                <FoodTile icon={step.icon} tone={step.tone} />
                <span className="font-display text-4xl text-border">
                  {index + 1}
                </span>
              </div>
              <h3 className="mt-6 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <SectionHeading
          eyebrow="Why Plenly"
          title="Less deciding, less wasting, less running back to the store."
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          <FeatureCard
            className="lg:col-span-2"
            title="Planned as a week, not five random recipes"
            body="Plenly picks dinners that fit together, so the half bunch of cilantro from Tuesday actually gets used on Friday."
          >
            <div className="flex flex-wrap items-center gap-3">
              <MiniMeal day="Tue" name="Salmon bowls" />
              <div className="flex items-center gap-2 text-sage-ink">
                <span className="h-px w-8 bg-sage/50" />
                <Badge tone="sage">
                  <Leaf />
                  Cilantro
                </Badge>
                <span className="h-px w-8 bg-sage/50" />
              </div>
              <MiniMeal day="Fri" name="Fajita salad" />
            </div>
          </FeatureCard>

          <FeatureCard
            title="A pantry that can be approximate"
            body="No weighing flour. Mark things as you'd say them out loud."
          >
            <div className="flex flex-wrap gap-2">
              <PantryStateBadge state="have" />
              <PantryStateBadge state="low" />
              <PantryStateBadge state="out" />
              <PantryStateBadge state="unsure" />
            </div>
          </FeatureCard>

          <FeatureCard
            title="One list for every recipe"
            body="Ingredients are combined and checked against your kitchen before anything goes on the list."
          >
            <ul className="space-y-2 text-sm">
              {[
                ["Garlic", "6 cloves", "3 recipes"],
                ["Lemons", "2", "2 recipes"],
                ["Chicken thighs", "1½ lb", "1 recipe"],
              ].map(([item, qty, from]) => (
                <li key={item} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2">
                    <ListChecks className="size-4 text-sage-ink" />
                    {item}
                  </span>
                  <span className="text-muted-foreground">
                    {qty} <span className="text-xs">· {from}</span>
                  </span>
                </li>
              ))}
            </ul>
          </FeatureCard>

          <FeatureCard
            className="lg:col-span-2"
            title="Nothing reaches your cart without a yes"
            body="Review the plan, the list, and every product match. Then send it to Kroger and check out the way you normally do."
          >
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {["Approve plan", "Review list", "Confirm products", "Send to cart"].map(
                (label, index, all) => (
                  <span key={label} className="flex items-center gap-2">
                    <span className="flex items-center gap-2 rounded-full border bg-background px-3 py-1.5">
                      <ShieldCheck className="size-4 text-primary" />
                      {label}
                    </span>
                    {index < all.length - 1 && (
                      <ArrowRight className="size-4 text-muted-foreground" />
                    )}
                  </span>
                ),
              )}
            </div>
          </FeatureCard>
        </div>
      </div>
    </section>
  );
}

function ClosingCta({ primaryHref, signedIn }: { primaryHref: string; signedIn: boolean }) {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-primary px-8 py-16 text-primary-foreground sm:px-16">
        <div className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-saffron/25 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 size-80 rounded-full bg-sage/40 blur-3xl" aria-hidden />
        <div className="relative flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <h2 className="font-display text-4xl leading-tight font-medium sm:text-5xl">
              Get your weeknights back.
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/75">
              Set up takes about two minutes. Planning each week after that takes
              even less.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-primary-foreground/80">
              <span className="flex items-center gap-2">
                <Users className="size-4 text-saffron" /> Solo cooks to small households
              </span>
              <span className="flex items-center gap-2">
                <Timer className="size-4 text-saffron" /> Recipes that fit your time
              </span>
            </div>
          </div>
          <Link
            href={primaryHref}
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-primary-foreground text-primary shadow-none hover:bg-primary-foreground/90",
            )}
          >
            {signedIn ? "Go to my week" : "Create your account"}
            <ArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-muted-foreground sm:flex-row">
        <Logo />
        <p>A CS498 senior design project · {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm font-semibold tracking-[0.14em] text-tomato-ink uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-4xl leading-tight font-medium sm:text-[2.75rem]">
        {title}
      </h2>
    </div>
  );
}

function FeatureCard({
  title,
  body,
  children,
  className,
}: {
  title: string;
  body: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between gap-8 rounded-3xl border bg-card p-7 shadow-[0_1px_2px_rgba(28,41,32,0.04)]",
        className,
      )}
    >
      <div>
        <h3 className="font-display text-2xl font-medium">{title}</h3>
        <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted-foreground">
          {body}
        </p>
      </div>
      <div className="rounded-2xl bg-muted/60 p-5">{children}</div>
    </div>
  );
}

function MiniMeal({ day, name }: { day: string; name: string }) {
  return (
    <span className="flex items-center gap-2 rounded-2xl border bg-card px-3 py-2 text-sm shadow-xs">
      <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
        {day}
      </span>
      {name}
    </span>
  );
}
