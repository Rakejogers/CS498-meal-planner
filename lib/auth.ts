/** Where signed-in users land after signing in or up. */
export const APP_HOME = "/dashboard";

// Anyone can visit these (and anything under them). Every other route needs a
// signed-in user, so new pages are protected by default.
const PUBLIC_ROUTES = ["/", "/login", "/auth"];

export function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || (route !== "/" && pathname.startsWith(`${route}/`)),
  );
}

// Stand-in origin for parsing. Only used to check that a path stays on-site.
const SAME_SITE = "http://same-site.invalid";

/** Only allow same-site relative redirects like "/dashboard". */
export function safeNextPath(next: string | null | undefined, fallback: string) {
  if (!next?.startsWith("/")) return fallback;
  // Parse it the way a browser will. That catches tricks a string check misses,
  // like "/\t/evil.com", which becomes "//evil.com" once the tab is dropped.
  const url = URL.parse(next, SAME_SITE);
  if (url?.origin !== SAME_SITE) return fallback;
  return url.pathname + url.search + url.hash;
}

/** Google serves profile photos from here. next.config.ts allows the same host for next/image. */
export const GOOGLE_AVATAR_HOST = "lh3.googleusercontent.com";

/**
 * The Google profile photo from a user's auth metadata, or null. Users can edit
 * their own metadata, so only accept Google's photo host: next/image throws on
 * any host it isn't configured for, which would break every signed-in page.
 */
export function googleAvatarUrl(metadata: Record<string, unknown> | undefined) {
  const raw = metadata?.avatar_url ?? metadata?.picture;
  if (typeof raw !== "string") return null;
  const url = URL.parse(raw);
  if (url?.protocol !== "https:" || url.hostname !== GOOGLE_AVATAR_HOST || url.port || url.search)
    return null;
  return url.href;
}
