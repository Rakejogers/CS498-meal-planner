const RETRY_DELAYS_MS = [100, 500];

/**
 * fetch for Supabase clients that retries one PostgREST failure: right after a
 * token is minted (sign-up, sign-in, session refresh), PostgREST can reject its
 * first use with PGRST303 "JWT issued at future" because its cached clock lags
 * after an idle period. The same token is accepted a moment later. The request
 * was refused before running, so retrying is safe.
 */
export const supabaseFetch: typeof fetch = async (input, init) => {
  let response = await fetch(input, init);
  for (const delay of RETRY_DELAYS_MS) {
    if (!(await isFreshTokenRejection(response))) break;
    await new Promise((resolve) => setTimeout(resolve, delay));
    // A signal opts out of Next's per-render fetch memoization, which would
    // otherwise hand back the same rejected response.
    response = await fetch(input, {
      ...init,
      signal: init?.signal ?? new AbortController().signal,
    });
  }
  return response;
};

async function isFreshTokenRejection(response: Response) {
  if (response.status !== 401) return false;
  const body = await response
    .clone()
    .json()
    .catch(() => null);
  return body?.code === "PGRST303" && /issued at future/i.test(body.message ?? "");
}
