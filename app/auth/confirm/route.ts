import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/**
 * Landing spot for email links (sign-up confirmation, magic links). Local
 * Supabase confirms accounts instantly, so this matters once email
 * confirmation is turned on in a hosted project.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const next = safeNextPath(searchParams.get("next"), "/onboarding");
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const supabase = await createClient();
  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
      : { error: new Error("Missing confirmation token") };

  if (error) {
    return NextResponse.redirect(new URL("/login?error=confirm", request.url));
  }
  return NextResponse.redirect(new URL(next, request.url));
}
