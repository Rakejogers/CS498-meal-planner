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
