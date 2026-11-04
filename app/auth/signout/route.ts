import { NextResponse, type NextRequest } from "next/server";
import { clearSessionCookie } from "@/lib/kroger/session";
import { createClient } from "@/lib/supabase/server";

async function signOut(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // 303 so a POST from the sign-out form becomes a GET.
  const response = NextResponse.redirect(new URL("/login", request.url), 303);
  // The Kroger login belongs to this account, not the next person on this browser.
  clearSessionCookie(response.cookies);
  return response;
}

export { signOut as GET, signOut as POST };
