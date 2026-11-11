import { NextResponse, type NextRequest } from "next/server";
import { APP_HOME, safeNextPath } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/**
 * Where Google (via Supabase) sends the user back after they pick an account.
 * Swaps the one-time code for a session. If they cancelled on Google's side,
 * there's no code, just an `error` param.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const next = safeNextPath(searchParams.get("next"), APP_HOME);
  const code = searchParams.get("code");

  const supabase = await createClient();
  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : { error: new Error("Missing OAuth code") };

  if (error) {
    return NextResponse.redirect(new URL("/login?error=google", request.url));
  }
  return NextResponse.redirect(new URL(next, request.url));
}
