import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";
import { getUser } from "@/lib/data";
import { refreshUserTokens, type UserTokens } from "./oauth";

// The user's Kroger login, kept in an httpOnly cookie rather than the
// database so browser code (and a leaked Supabase session) can't read it.
//
// The cookie belongs to the browser, not the Plantry account, so it records
// whose it is. If someone else signs in on the same browser, it's ignored.

export const SESSION_COOKIE = "plantry_kroger";
const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 90 * 24 * 60 * 60,
} as const;

// Refresh a minute early so a token never expires mid-request.
const EXPIRY_MARGIN_MS = 60_000;

const sessionSchema = z.object({
  userId: z.string().min(1),
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresAt: z.number(),
});

/** Anything cookies can be written to: `await cookies()` or `response.cookies`. */
type CookieWriter = {
  set(name: string, value: string, options?: Record<string, unknown>): unknown;
};

export function encodeSession(userId: string, tokens: UserTokens) {
  return Buffer.from(JSON.stringify({ userId, ...tokens })).toString("base64url");
}

/**
 * The tokens in a session cookie, if it's well formed and belongs to
 * `userId`. Null otherwise.
 */
export function decodeSession(cookie: string | undefined, userId: string): UserTokens | null {
  if (!cookie) return null;
  try {
    const parsed = sessionSchema.safeParse(JSON.parse(Buffer.from(cookie, "base64url").toString()));
    if (!parsed.success || parsed.data.userId !== userId) return null;
    const { accessToken, refreshToken, expiresAt } = parsed.data;
    return { accessToken, refreshToken, expiresAt };
  } catch {
    return null;
  }
}

export function setSessionCookie(jar: CookieWriter, userId: string, tokens: UserTokens) {
  jar.set(SESSION_COOKIE, encodeSession(userId, tokens), SESSION_COOKIE_OPTIONS);
}

export function clearSessionCookie(jar: CookieWriter) {
  jar.set(SESSION_COOKIE, "", { ...SESSION_COOKIE_OPTIONS, maxAge: 0 });
}

async function readSession() {
  const user = await getUser();
  if (!user) return null;
  const tokens = decodeSession((await cookies()).get(SESSION_COOKIE)?.value, user.sub);
  return tokens ? { userId: user.sub, tokens } : null;
}

/**
 * Whether the signed-in user has connected Kroger on this browser. Safe to
 * call while rendering. It doesn't check with Kroger, so a login Kroger has
 * since revoked still counts until the next cart request fails.
 */
export async function isKrogerConnected() {
  return (await readSession()) !== null;
}

/**
 * A working access token for the signed-in user's Kroger cart, refreshing it
 * if needed. Null if they haven't connected Kroger or the login has expired.
 * Only call this from a Server Action or Route Handler: refreshing rewrites
 * the cookie.
 */
export async function getKrogerAccessToken() {
  const session = await readSession();
  if (!session) return null;
  const { userId, tokens } = session;
  if (tokens.expiresAt - EXPIRY_MARGIN_MS > Date.now()) return tokens.accessToken;

  const jar = await cookies();
  try {
    const fresh = await refreshUserTokens(tokens.refreshToken);
    setSessionCookie(jar, userId, fresh);
    return fresh.accessToken;
  } catch (error) {
    console.error("Kroger token refresh failed:", error);
    clearSessionCookie(jar);
    return null;
  }
}

/** Forgets the Kroger login on this browser. */
export async function disconnectKroger() {
  clearSessionCookie(await cookies());
}
