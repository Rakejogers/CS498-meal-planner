import "server-only";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { KROGER_API, KrogerError, krogerConfig, requestToken } from "./client";

// Kroger login (OAuth authorization code flow). The user signs in on
// kroger.com and Kroger sends them back to /api/kroger/callback with a code,
// which is swapped for tokens that can add to their cart.
//
// `state` ties the callback to the browser that started the login, so nobody
// can send a victim back with a code for the attacker's Kroger account.

/** Adding to the cart is all we ask Kroger to allow. */
const SCOPE = "cart.basic:write";

export const OAUTH_STATE_COOKIE = "plantry_kroger_oauth";
export const OAUTH_STATE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax", // Sent on the top-level redirect back from kroger.com.
  path: "/api/kroger",
  maxAge: 10 * 60,
} as const;

const oauthStateSchema = z.object({
  state: z.string().min(32),
  /** Where to send the user afterwards. Checked with safeNextPath first. */
  next: z.string(),
});

export type OAuthState = z.infer<typeof oauthStateSchema>;

/** A new random state, and the cookie value that remembers it. */
export function createOAuthState(next: string) {
  const state = randomBytes(32).toString("base64url");
  const cookie = Buffer.from(JSON.stringify({ state, next })).toString("base64url");
  return { state, cookie };
}

/** What the state cookie holds, or null if it's missing or tampered with. */
export function readOAuthState(cookie: string | undefined): OAuthState | null {
  if (!cookie) return null;
  try {
    const parsed = oauthStateSchema.safeParse(
      JSON.parse(Buffer.from(cookie, "base64url").toString()),
    );
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/** The kroger.com page where the user signs in and approves Plantry. */
export function krogerAuthorizeUrl(state: string) {
  const { clientId, redirectUri } = krogerConfig();
  const url = new URL(`${KROGER_API}/connect/oauth2/authorize`);
  url.search = new URLSearchParams({
    scope: SCOPE,
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
  }).toString();
  return url.toString();
}

export type UserTokens = {
  accessToken: string;
  refreshToken: string;
  /** Epoch milliseconds. */
  expiresAt: number;
};

function toUserTokens(
  tokens: Awaited<ReturnType<typeof requestToken>>,
  previousRefreshToken?: string,
): UserTokens {
  const refreshToken = tokens.refresh_token ?? previousRefreshToken;
  if (!refreshToken) throw new KrogerError("Kroger didn't return a refresh token");
  return {
    accessToken: tokens.access_token,
    refreshToken,
    expiresAt: Date.now() + tokens.expires_in * 1000,
  };
}

/** Swaps the code from the callback for the user's tokens. */
export async function exchangeCode(code: string) {
  const { redirectUri } = krogerConfig();
  const tokens = await requestToken({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });
  return toUserTokens(tokens);
}

/** New tokens for a user whose access token has expired. */
export async function refreshUserTokens(refreshToken: string) {
  const tokens = await requestToken({ grant_type: "refresh_token", refresh_token: refreshToken });
  return toUserTokens(tokens, refreshToken);
}

/** Where the login flow returns to when nothing else was asked for. */
export const KROGER_SETTINGS_PATH = "/settings/kroger";

/** How the login went, added to the return URL as `?kroger=`. */
export type KrogerConnectStatus = "connected" | "denied" | "error" | "unavailable";

/** `next` (a same-site path) with `?kroger=<status>` added. */
export function returnUrl(next: string, status: KrogerConnectStatus, base: string) {
  const url = new URL(next, base);
  url.searchParams.set("kroger", status);
  return url;
}
