import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { WeekPreview } from "@/components/week-preview";
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
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Logo />

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-14">
          <h1 className="font-display text-4xl font-medium">
            {mode === "signup" ? "Let's get cooking" : "Welcome back"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {mode === "signup"
              ? "Create your account. Setup takes about two minutes."
              : "Sign in to pick up this week's plan."}
          </p>

          <div className="mt-8 grid grid-cols-2 rounded-full bg-secondary p-1 text-sm font-medium">
            {(["signin", "signup"] as const).map((target) => (
              <Link
                key={target}
                href={modeHref(target)}
                replace
                scroll={false}
                aria-current={mode === target ? "page" : undefined}
                className={cn(
                  "rounded-full py-2 text-center transition-all",
                  mode === target
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {target === "signin" ? "Sign in" : "Create account"}
              </Link>
            ))}
          </div>

          {confirmFailed && (
            <p className="mt-6 rounded-2xl bg-tomato-soft px-4 py-3 text-sm text-tomato-ink">
              That confirmation link is invalid or has expired. Try signing in,
              or create your account again.
            </p>
          )}

          <AuthForm key={mode} mode={mode} next={next} />
        </div>

        <p className="text-xs text-muted-foreground">
          Plenly is a student project. Please don&apos;t reuse an important password.
        </p>
      </div>

      <aside className="relative m-3 hidden overflow-hidden rounded-[2rem] bg-primary lg:flex lg:flex-col lg:justify-between lg:p-14">
        <div className="pointer-events-none absolute -top-32 -right-32 size-[30rem] rounded-full bg-saffron/25 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-40 -left-20 size-[28rem] rounded-full bg-sage/50 blur-3xl" aria-hidden />

        <div className="relative max-w-md">
          <p className="font-display text-5xl leading-[1.05] font-medium text-primary-foreground">
            What&apos;s for dinner?
            <br />
            <em className="font-normal text-saffron italic">Already answered.</em>
          </p>
          <p className="mt-5 text-lg text-primary-foreground/70">
            A whole week of dinners, planned around your kitchen, in the time it
            takes to preheat the oven.
          </p>
        </div>

        <WeekPreview floating={false} className="relative w-full max-w-md self-end" />
      </aside>
    </div>
  );
}
