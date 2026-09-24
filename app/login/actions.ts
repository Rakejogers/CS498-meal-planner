"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { safeNextPath } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = {
  error?: string;
  notice?: string;
  name?: string;
  email?: string;
};

const signInSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

const signUpSchema = z.object({
  name: z.string().trim().min(1, "Tell us your first name.").max(60),
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters for your password."),
});

const field = (formData: FormData, key: string) => String(formData.get(key) ?? "");

export async function signIn(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = field(formData, "email").trim();
  const parsed = signInSchema.safeParse({ email, password: field(formData, "password") });
  if (!parsed.success) return { error: parsed.error.issues[0].message, email };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return {
      error:
        error.code === "invalid_credentials"
          ? "That email and password don't match."
          : error.message,
      email,
    };
  }

  redirect(safeNextPath(field(formData, "next"), "/dashboard"));
}

export async function signUp(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = field(formData, "name").trim();
  const email = field(formData, "email").trim();
  const parsed = signUpSchema.safeParse({ name, email, password: field(formData, "password") });
  if (!parsed.success) return { error: parsed.error.issues[0].message, name, email };

  const origin = (await headers()).get("origin") ?? "http://localhost:3000";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.name },
      emailRedirectTo: `${origin}/auth/confirm?next=/onboarding`,
    },
  });

  if (error) {
    return {
      error:
        error.code === "user_already_exists"
          ? "There's already an account with that email. Try signing in."
          : error.message,
      name,
      email,
    };
  }

  // No session means email confirmation is on (hosted projects).
  if (!data.session) {
    return { notice: `We sent a confirmation link to ${email}.`, name, email };
  }

  redirect("/onboarding");
}
