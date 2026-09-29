import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function signOut(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // 303 so a POST from the sign-out form becomes a GET.
  return NextResponse.redirect(new URL("/login", request.url), 303);
}

export { signOut as GET, signOut as POST };
