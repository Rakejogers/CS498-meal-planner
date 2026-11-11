import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { AuthForm } from "./auth-form";
import { FeatureShowcase } from "./feature-showcase";
import { GoogleButton } from "./google-button";

export const metadata: Metadata = {
  title: "Log in",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const mode = params.mode === "signup" ? "signup" : "signin";
  const withEmail = params.method === "email";
  const next = typeof params.next === "string" ? params.next : undefined;
  const errorMessage =
    params.error === "confirm"
      ? "That confirmation link is invalid or has expired. Try signing in, or create your account again."
      : params.error === "google"
        ? "We couldn't sign you in with Google. Give it another try."
        : undefined;

  // Google is the default. Email and password sits behind `?method=email`.
  const loginHref = (target: { mode: "signin" | "signup"; email: boolean }) => {
    const query = new URLSearchParams();
    if (target.mode === "signup") query.set("mode", "signup");
    if (target.email) query.set("method", "email");
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

          {errorMessage && (
            <p className="mt-6 rounded-2xl bg-tomato-soft px-4 py-3 text-sm text-tomato-ink">
              {errorMessage}
            </p>
          )}

          <div className="mt-8">
            <GoogleButton next={next} />
          </div>

          {withEmail ? (
            <>
              <div className="mt-6 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                or with email
                <span className="h-px flex-1 bg-border" />
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
                    href={loginHref({ mode: target, email: true })}
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

              <AuthForm mode={mode} next={next} />
            </>
          ) : (
            <Link
              href={loginHref({ mode, email: true })}
              replace
              scroll={false}
              className="mt-5 self-center text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Use email instead
            </Link>
          )}
        </div>
      </div>

      {/* On phones this sits below the form, so the form stays the first thing on screen. */}
      <aside
        aria-label="What Plantry does"
        className="relative m-3 flex flex-col overflow-hidden rounded-[2rem] bg-primary px-6 py-9 sm:px-10 sm:py-12 lg:p-12 xl:p-14 short:p-9!"
      >
        <FeatureShowcase />
      </aside>
    </div>
  );
}
