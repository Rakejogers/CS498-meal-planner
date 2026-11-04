import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/auth";
import { requireUser } from "@/lib/data";
import {
  exchangeCode,
  KROGER_SETTINGS_PATH,
  OAUTH_STATE_COOKIE,
  OAUTH_STATE_COOKIE_OPTIONS,
  readOAuthState,
  returnUrl,
  type KrogerConnectStatus,
} from "@/lib/kroger/oauth";
import { setSessionCookie } from "@/lib/kroger/session";

/**
 * Where Kroger sends the user after they sign in there. Must match
 * KROGER_REDIRECT_URI and the redirect URI registered with Kroger.
 */
export async function GET(request: NextRequest) {
  const user = await requireUser();
  const { searchParams } = request.nextUrl;
  const saved = readOAuthState(request.cookies.get(OAUTH_STATE_COOKIE)?.value);
  const next = safeNextPath(saved?.next, KROGER_SETTINGS_PATH);

  const finish = (status: KrogerConnectStatus) => {
    const response = NextResponse.redirect(returnUrl(next, status, request.url));
    // State is single use.
    response.cookies.set(OAUTH_STATE_COOKIE, "", { ...OAUTH_STATE_COOKIE_OPTIONS, maxAge: 0 });
    return response;
  };

  // Only finish a login this browser started.
  const state = searchParams.get("state");
  if (!saved || !state || state !== saved.state) return finish("error");

  const code = searchParams.get("code");
  if (!code) return finish(searchParams.get("error") === "access_denied" ? "denied" : "error");

  try {
    const tokens = await exchangeCode(code);
    const response = finish("connected");
    setSessionCookie(response.cookies, user.sub, tokens);
    return response;
  } catch (error) {
    console.error("Kroger code exchange failed:", error);
    return finish("error");
  }
}
