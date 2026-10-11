"use client";

import { ArrowRight, Eye, EyeOff, Loader2, MailCheck } from "lucide-react";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { signIn, signUp, type AuthFormState } from "./actions";

type Mode = "signin" | "signup";

export function AuthForm({ mode, next }: { mode: Mode; next?: string }) {
  // Only animate the name field when the toggle was used, not on first load.
  const [shownMode, setShownMode] = useState(mode);
  const [switched, setSwitched] = useState(false);
  if (mode !== shownMode) {
    setShownMode(mode);
    setSwitched(true);
  }

  return <AuthFields key={mode} mode={mode} next={next} switched={switched} />;
}

function AuthFields({ mode, next, switched }: { mode: Mode; next?: string; switched: boolean }) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    mode === "signup" ? signUp : signIn,
    {},
  );
  const [showPassword, setShowPassword] = useState(false);

  if (state.notice) {
    return (
      <div className="mt-8 rounded-3xl border bg-card p-6 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-sage-soft text-sage-ink">
          <MailCheck className="size-6" />
        </span>
        <p className="mt-4 font-display text-xl font-medium">Check your inbox</p>
        <p className="mt-1 text-sm text-muted-foreground">{state.notice}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-6" noValidate>
      {next && <input type="hidden" name="next" value={next} />}

      {/* After a toggle the name field opens, or a disabled copy of it closes, so the form resizes smoothly. */}
      {(mode === "signup" || switched) && (
        <div
          aria-hidden={mode === "signin" || undefined}
          className={cn(
            "grid",
            switched && (mode === "signup" ? "animate-field-open" : "animate-field-close"),
          )}
        >
          {/* The side padding leaves room for the focus ring inside the clip. */}
          <div className="-mx-1 min-h-0 overflow-hidden px-1">
            <div className="space-y-2 pb-4">
              <Label htmlFor="name">First name</Label>
              <Input
                id="name"
                name="name"
                autoComplete="given-name"
                placeholder="Alex"
                defaultValue={state.name}
                disabled={mode === "signin"}
                className="disabled:opacity-100"
                required
              />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            defaultValue={state.email}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
              className="pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((shown) => !shown)}
              className="absolute inset-y-0 right-0 grid w-12 cursor-pointer place-items-center rounded-r-xl text-muted-foreground transition-colors hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {state.error && (
          <p role="alert" className="rounded-2xl bg-tomato-soft px-4 py-3 text-sm text-tomato-ink">
            {state.error}
          </p>
        )}

        <Button type="submit" size="lg" className="mt-2 w-full" disabled={pending}>
          {pending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              {mode === "signup" ? "Create account" : "Sign in"}
              <ArrowRight />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
