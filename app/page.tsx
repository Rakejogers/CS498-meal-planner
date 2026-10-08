import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { LogoMark, Wordmark } from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";
import { APP_HOME } from "@/lib/auth";
import { getUser } from "@/lib/data";

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

      <div className="mt-9 flex animate-rise flex-col items-center gap-4 [animation-delay:480ms]">
        <Link
          href={signedIn ? APP_HOME : "/login?mode=signup"}
          className={buttonVariants({ size: "lg", className: "group min-w-48" })}
        >
          {signedIn ? "Open Plantry" : "Get started"}
          <ArrowRight className="transition-transform group-hover:translate-x-1" />
        </Link>
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
