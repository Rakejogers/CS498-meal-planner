import { ArrowRight, Check, Sprout } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { APP_HOME } from "@/lib/auth";
import { getUser } from "@/lib/data";
import { cn } from "@/lib/utils";

const HIGHLIGHTS = ["Plans the whole week", "Uses what you already have", "You approve everything"];

export default async function Home() {
  const signedIn = Boolean(await getUser());

  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-clip">
      <SiteHeader signedIn={signedIn} />
      <main className="flex flex-1 items-center">
        <Hero signedIn={signedIn} />
      </main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
        <Logo />
        <div className="flex items-center gap-2">
          {signedIn ? (
            <Link href={APP_HOME} className={buttonVariants({ size: "sm" })}>
              Open Plantry
              <ArrowRight />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "px-2 sm:px-4")}
              >
                Log in
              </Link>
              <Link
                href="/login?mode=signup"
                className={cn(buttonVariants({ size: "sm" }), "px-2 sm:px-4")}
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

function Hero({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="relative w-full">
      {/* Soft color washes behind the hero */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute -top-40 right-[-10%] size-[42rem] rounded-full bg-saffron-soft/80 blur-3xl" />
        <div className="absolute top-40 right-[25%] size-[26rem] rounded-full bg-sage-soft blur-3xl" />
        <div className="absolute top-10 -left-40 size-[28rem] rounded-full bg-tomato-soft/50 blur-3xl" />
      </div>

      <div className="mx-auto flex max-w-3xl animate-fade-up flex-col items-center px-6 py-24 text-center lg:py-32">
        <Badge tone="sage" className="px-3 py-1 text-[13px]">
          <Sprout className="size-3.5!" />
          Weekly dinners, without the weekly planning
        </Badge>
        <h1 className="mt-6 font-display text-5xl leading-[1.02] font-medium sm:text-6xl lg:text-[4.5rem]">
          Dinner, <em className="font-normal text-primary italic">sorted</em>
          <br />
          for the whole week.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
          Plantry plans a week of dinners around what you like and what&apos;s already in your
          kitchen, then turns it into one tidy grocery list, ready for your cart.
        </p>
        <Link
          href={signedIn ? APP_HOME : "/login?mode=signup"}
          className={buttonVariants({ size: "lg", className: "mt-9" })}
        >
          {signedIn ? "Go to my week" : "Plan my first week"}
          <ArrowRight />
        </Link>
        <ul className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
          {HIGHLIGHTS.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="grid size-5 place-items-center rounded-full bg-sage-soft text-sage-ink">
                <Check className="size-3" strokeWidth={3} />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
        <Logo />
        <p>A CS498 senior design project · {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
