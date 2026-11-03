import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/auth";
import { requireUser } from "@/lib/data";
import { isKrogerConfigured } from "@/lib/kroger/client";
import {
  createOAuthState,
  KROGER_SETTINGS_PATH,
  krogerAuthorizeUrl,
  OAUTH_STATE_COOKIE,
  OAUTH_STATE_COOKIE_OPTIONS,
  returnUrl,
} from "@/lib/kroger/oauth";

/**
 * Starts the Kroger login. Link here (with an optional same-site `?next=`) and
 * the user comes back to `next` with `?kroger=connected` or another status.
 */
export async function GET(request: NextRequest) {
  await requireUser();
  const next = safeNextPath(request.nextUrl.searchParams.get("next"), KROGER_SETTINGS_PATH);

  if (!isKrogerConfigured()) {
    return NextResponse.redirect(returnUrl(next, "unavailable", request.url));
  }

  const { state, cookie } = createOAuthState(next);
  const response = NextResponse.redirect(krogerAuthorizeUrl(state));
  response.cookies.set(OAUTH_STATE_COOKIE, cookie, OAUTH_STATE_COOKIE_OPTIONS);
  return response;
}
