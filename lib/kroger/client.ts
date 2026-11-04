import "server-only";
import { z } from "zod";

// Low-level Kroger API access: credentials, tokens, and authenticated GETs.
// Feature code should use stores.ts, products.ts, cart.ts, and session.ts
// instead of calling this directly.
//
// Kroger has two kinds of token:
// - An app token (client credentials) for public data: stores and products.
//   No Kroger login needed. Cached here in memory.
// - A user token (OAuth login) for the user's cart. See session.ts.

export const KROGER_API = "https://api.kroger.com/v1";

export class KrogerError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "KrogerError";
  }
}

/** False when the Kroger env vars aren't set, e.g. in CI. */
export function isKrogerConfigured() {
  return Boolean(
    process.env.KROGER_CLIENT_ID &&
    process.env.KROGER_CLIENT_SECRET &&
    process.env.KROGER_REDIRECT_URI,
  );
}

export function krogerConfig() {
  const clientId = process.env.KROGER_CLIENT_ID;
  const clientSecret = process.env.KROGER_CLIENT_SECRET;
  const redirectUri = process.env.KROGER_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new KrogerError("Missing KROGER_CLIENT_ID, KROGER_CLIENT_SECRET, or KROGER_REDIRECT_URI");
  }
  return { clientId, clientSecret, redirectUri };
}

const tokenSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.number().positive(),
  refresh_token: z.string().min(1).optional(),
});

export type KrogerTokens = z.infer<typeof tokenSchema>;

/** POSTs to Kroger's token endpoint with the app's credentials. */
export async function requestToken(params: Record<string, string>): Promise<KrogerTokens> {
  const { clientId, clientSecret } = krogerConfig();
  const response = await fetch(`${KROGER_API}/connect/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new KrogerError(`Kroger token request failed (${params.grant_type})`, response.status);
  }
  return tokenSchema.parse(await response.json());
}

// Refresh a minute early so a token never expires mid-request.
const EXPIRY_MARGIN_MS = 60_000;

let appToken: { value: string; expiresAt: number } | null = null;

async function getAppToken() {
  if (appToken && appToken.expiresAt - EXPIRY_MARGIN_MS > Date.now()) return appToken.value;
  const tokens = await requestToken({ grant_type: "client_credentials", scope: "product.compact" });
  appToken = { value: tokens.access_token, expiresAt: Date.now() + tokens.expires_in * 1000 };
  return appToken.value;
}

/**
 * GETs a public Kroger endpoint with the app token and returns the JSON body,
 * or null for a 404.
 */
export async function krogerGet(path: string, params: Record<string, string> = {}) {
  const url = new URL(`${KROGER_API}${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

  const send = async () =>
    fetch(url, {
      headers: { Authorization: `Bearer ${await getAppToken()}`, Accept: "application/json" },
      cache: "no-store",
    });

  let response = await send();
  // A cached token can be revoked early. Get a new one and try once more.
  if (response.status === 401) {
    appToken = null;
    response = await send();
  }

  if (response.status === 404) return null;
  if (!response.ok) throw new KrogerError(`Kroger GET ${path} failed`, response.status);
  return (await response.json()) as unknown;
}
