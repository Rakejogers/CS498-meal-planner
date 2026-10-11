import type { Metadata } from "next";
import Link from "next/link";
import { Logo, LogoMark } from "@/components/logo";
import { cn } from "@/lib/utils";
import { AuthForm } from "./auth-form";

export const metadata: Metadata = {
  title: "Log in",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const mode = params.mode === "signup" ? "signup" : "signin";
  const next = typeof params.next === "string" ? params.next : undefined;
  const confirmFailed = params.error === "confirm";

  const modeHref = (target: "signin" | "signup") => {
    const query = new URLSearchParams();
    if (target === "signup") query.set("mode", "signup");
    if (next) query.set("next", next);
    const qs = query.toString();
    return qs ? `/login?${qs}` : "/login";
  };

  return (
    <div className="grid min-h-dvh lg:h-dvh lg:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-col px-6 py-6 sm:px-12 sm:py-8 lg:overflow-y-auto">
        <Logo className="self-start" />

        <div className="mx-auto flex w-full max-w-sm flex-1 animate-fade-up flex-col justify-center py-6 sm:py-10">
          {/* Keyed so the heading fades in again when the mode changes. */}
          <div key={mode} className="animate-fade-up">
            <h1 className="font-display text-4xl font-medium">
              {mode === "signup" ? "Let's get cooking" : "Welcome back"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {mode === "signup"
                ? "Create your account to start planning your week."
                : "Sign in to pick up where you left off."}
            </p>
          </div>

          <div className="relative mt-6 grid grid-cols-2 rounded-full bg-secondary p-1 text-sm font-medium">
            <span
              aria-hidden
              className={cn(
                "absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-card shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                mode === "signup" && "translate-x-full",
              )}
            />
            {(["signin", "signup"] as const).map((target) => (
              <Link
                key={target}
                href={modeHref(target)}
                replace
                scroll={false}
                aria-current={mode === target ? "page" : undefined}
                className={cn(
                  "relative rounded-full py-2 text-center transition-colors duration-300",
                  mode === target
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {target === "signin" ? "Sign in" : "Create account"}
              </Link>
            ))}
          </div>

          {confirmFailed && (
            <p className="mt-6 rounded-2xl bg-tomato-soft px-4 py-3 text-sm text-tomato-ink">
              That confirmation link is invalid or has expired. Try signing in, or create your
              account again.
            </p>
          )}

          <AuthForm mode={mode} next={next} />
        </div>
      </div>

      <aside className="relative m-3 hidden overflow-hidden rounded-[2rem] bg-primary lg:flex lg:flex-col lg:justify-center lg:p-14">
        <div
          className="pointer-events-none absolute -top-32 -right-32 size-[30rem] animate-drift rounded-full bg-saffron/25 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-40 -left-20 size-[28rem] rounded-full bg-sage/50 blur-3xl"
          aria-hidden
        />

        <div className="relative max-w-md animate-rise [animation-delay:150ms]">
          <LogoMark variant="badge" className="mb-8 size-20" />
          <p className="font-display text-5xl leading-[1.05] font-medium text-primary-foreground">
            What&apos;s for dinner?
            <br />
            <em className="font-normal text-saffron italic">Already answered.</em>
          </p>
          <p className="mt-5 text-lg text-primary-foreground/70">
            A whole week of dinners, planned around your kitchen, in the time it takes to preheat
            the oven.
          </p>
        </div>
      </aside>
    </div>
  );
}
