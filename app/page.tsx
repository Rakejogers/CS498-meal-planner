import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { LogoMark, Wordmark } from "@/components/logo";
import { APP_HOME } from "@/lib/auth";
import { getUser } from "@/lib/data";
import { cn } from "@/lib/utils";

export default async function Home() {
  const signedIn = Boolean(await getUser());

  return (
    <main className="relative isolate flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-10 text-center">
      {/* Soft color washes drifting behind the content */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute -top-[20%] -right-[15%] size-[min(42rem,110vw)] animate-drift rounded-full bg-saffron-soft/80 blur-3xl" />
        <div className="absolute -bottom-[25%] left-[10%] size-[min(34rem,90vw)] animate-drift rounded-full bg-sage-soft blur-3xl [animation-delay:-8s] [animation-duration:28s]" />
        <div className="absolute top-[5%] -left-[20%] size-[min(28rem,80vw)] animate-drift rounded-full bg-tomato-soft/50 blur-3xl [animation-direction:alternate-reverse] [animation-duration:18s]" />
      </div>

      <div className="animate-rise">
        <LogoMark
          className="size-24 animate-float sm:size-28"
          sizes="(min-width: 640px) 160px, 136px"
        />
      </div>

      <h1 className="mt-6 animate-rise [animation-delay:120ms]">
        <span className="sr-only">Plantry</span>
        <Wordmark className="w-52 sm:w-72" sizes="(min-width: 640px) 330px, 240px" />
      </h1>

      <p className="mt-10 animate-rise font-display text-3xl leading-[1.1] font-medium [animation-delay:260ms] sm:mt-12 sm:text-4xl">
        Dinner, <em className="font-normal text-primary italic">sorted</em> for the whole week.
      </p>
      <p className="mt-4 max-w-md animate-rise leading-relaxed text-muted-foreground [animation-delay:360ms] sm:text-lg">
        A week of dinners planned around your kitchen, and one tidy grocery list.
      </p>

      <div className="mt-12 flex animate-rise flex-col items-center gap-4 [animation-delay:480ms]">
        <BasketLink href={signedIn ? APP_HOME : "/login?mode=signup"}>
          {signedIn ? "Open Plantry" : "Get started"}
        </BasketLink>
        {!signedIn && (
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="rounded-sm font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-4 focus-visible:ring-ring/20"
            >
              Log in
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}

// Shared by the ingredients: they tumble in on hover and sink back into the basket after.
const INGREDIENT =
  "absolute translate-y-3 overflow-visible stroke-background stroke-2 opacity-0 [paint-order:stroke] transition duration-200 group-hover:translate-y-0 group-hover:animate-drop-in group-hover:opacity-100 group-hover:transition-none group-focus-visible:translate-y-0 group-focus-visible:animate-drop-in group-focus-visible:opacity-100 group-focus-visible:transition-none";

/** The primary action. On hover the pill squares off into the logo's basket and the ingredients drop in. */
function BasketLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group relative inline-flex h-13 min-w-48 items-center justify-center px-7 font-medium text-primary-foreground outline-none select-none"
    >
      {/* In drop order. Later ones sit in front, like the logo's tomato. */}
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0">
        <svg
          viewBox="0 0 40 44"
          className={cn(INGREDIENT, "-top-9 left-10 w-11 fill-sage [--drop-spin:-150deg]")}
        >
          <path d="M14 44C2 31 1 13 8 1c14 7 20 23 14 43Z" />
          <path d="M26 44c-2-12 2-22 12-27 3 10-1 21-8 27Z" />
        </svg>
        <svg
          viewBox="0 0 26 40"
          className={cn(
            INGREDIENT,
            "-top-9 left-34 w-8 rotate-3 fill-saffron [--drop-delay:180ms] [--drop-spin:130deg]",
          )}
        >
          <rect x="4" width="18" height="6" rx="3" />
          <rect x="1" y="9" width="24" height="31" rx="6" />
        </svg>
        <svg
          viewBox="0 0 20 64"
          className={cn(
            INGREDIENT,
            "-top-10 left-6 w-5 -rotate-12 fill-saffron-ink [--drop-delay:360ms] [--drop-spin:200deg]",
          )}
        >
          <rect x="1" y="1" width="18" height="62" rx="9" />
          <path
            d="m6 14 8 4M6 25l8 4M6 36l8 4"
            className="fill-none stroke-saffron-soft stroke-2 [stroke-linecap:round]"
          />
        </svg>
        <svg
          viewBox="0 0 28 48"
          className={cn(
            INGREDIENT,
            "-top-9 left-27 w-7.5 rotate-12 [--drop-delay:540ms] [--drop-spin:-170deg]",
          )}
        >
          <path
            d="M14 12c8 0 12 9 12 20 0 9-5 15-12 15S2 41 2 32c0-11 4-20 12-20Z"
            className="fill-plum"
          />
          <path
            d="M12 4a2 2 0 0 1 4 0v6c3 0 5 1 6 4-4 3-12 3-16 0 1-3 3-4 6-4Z"
            className="fill-sage-ink"
          />
        </svg>
        <svg
          viewBox="0 0 30 30"
          className={cn(
            INGREDIENT,
            "-top-8 left-[4.6rem] w-10 [--drop-delay:720ms] [--drop-spin:160deg]",
          )}
        >
          <circle cx="15" cy="18" r="12" className="fill-tomato" />
          <path d="m15 10-6-3 4.5-.5L15 2l1.5 4.5L21 7Z" className="fill-sage-ink" />
        </svg>
      </span>
      <span
        aria-hidden
        className="absolute inset-0 rounded-[1.625rem] bg-primary shadow-sm shadow-primary/20 transition-[border-radius,background-color,box-shadow] duration-300 ease-out group-hover:rounded-t-lg group-hover:bg-tomato group-hover:ring-2 group-hover:shadow-tomato/25 group-hover:ring-background group-focus-visible:rounded-t-lg group-focus-visible:bg-tomato group-focus-visible:ring-4 group-focus-visible:ring-ring/20 group-active:scale-[0.98] motion-reduce:transition-none"
      />
      <span className="relative inline-flex items-center gap-2">
        {children}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
