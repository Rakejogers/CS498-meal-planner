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

/** Only allow same-site relative redirects like "/dashboard". */
export function safeNextPath(next: string | null | undefined, fallback: string) {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return fallback;
  }
  return next;
}
