/** Only allow same-site relative redirects like "/dashboard". */
export function safeNextPath(next: string | null | undefined, fallback: string) {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return fallback;
  }
  return next;
}
