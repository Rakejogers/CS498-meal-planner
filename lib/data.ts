import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// Data access layer: every server-side read of user data goes through here, so
// the auth check can't be forgotten. Wrap loaders in `cache` so a layout and a
// page asking for the same thing share one request.

/** The signed-in user's verified JWT claims, or null. */
export const getUser = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return data?.claims ?? null;
});

/** The signed-in user's claims. Sends signed-out visitors to /login. */
export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

/** The signed-in user's profile. */
export const getProfile = cache(async () => {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.sub)
    .maybeSingle();

  if (error) throw new Error(error.message);

  // A valid session for a user that no longer exists (e.g. after `db:reset`).
  if (!data) redirect("/auth/signout");

  return {
    email: user.email ?? "",
    displayName: data.display_name,
  };
});

export type Profile = Awaited<ReturnType<typeof getProfile>>;
