// @vitest-environment node
import { NextRequest, type NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createOAuthState, OAUTH_STATE_COOKIE } from "@/lib/kroger/oauth";
import { decodeSession, SESSION_COOKIE } from "@/lib/kroger/session";
import { GET } from "./route";

// The real Kroger login needs a person on kroger.com, so no e2e test reaches
// this route. Unit test the checks that keep a login from landing on the
// wrong account.
vi.mock("server-only", () => ({}));
vi.mock("@/lib/data", () => ({
  requireUser: async () => ({ sub: "user-1" }),
  getUser: async () => ({ sub: "user-1" }),
}));

const exchangeCode = vi.hoisted(() => vi.fn());
vi.mock("@/lib/kroger/oauth", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/kroger/oauth")>()),
  exchangeCode,
}));

const tokens = { accessToken: "access", refreshToken: "refresh", expiresAt: 1 };

function call(query: string, stateCookie?: string) {
  const request = new NextRequest(`http://localhost:3000/api/kroger/callback?${query}`);
  if (stateCookie) request.cookies.set(OAUTH_STATE_COOKIE, stateCookie);
  return GET(request);
}

const sessionCookie = (response: NextResponse) => response.cookies.get(SESSION_COOKIE)?.value;

beforeEach(() => {
  exchangeCode.mockReset();
});

describe("GET /api/kroger/callback", () => {
  it("only finishes a login this browser started", async () => {
    const { state } = createOAuthState("/groceries");
    const missing = await call(`code=abc&state=${state}`);
    expect(missing.headers.get("location")).toBe(
      "http://localhost:3000/settings/kroger?kroger=error",
    );

    const other = createOAuthState("/groceries");
    const mismatched = await call(`code=abc&state=${state}`, other.cookie);
    expect(mismatched.headers.get("location")).toBe("http://localhost:3000/groceries?kroger=error");

    expect(exchangeCode).not.toHaveBeenCalled();
    expect(sessionCookie(missing)).toBeUndefined();
    expect(sessionCookie(mismatched)).toBeUndefined();
  });

  it("saves the login for the signed-in user and returns where the login started", async () => {
    exchangeCode.mockResolvedValue(tokens);
    const { state, cookie } = createOAuthState("/groceries");

    const response = await call(`code=abc&state=${state}`, cookie);

    expect(exchangeCode).toHaveBeenCalledWith("abc");
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/groceries?kroger=connected",
    );
    const saved = sessionCookie(response);
    expect(decodeSession(saved, "user-1")).toEqual(tokens);
    // Someone else signing in on this browser doesn't inherit the Kroger login.
    expect(decodeSession(saved, "user-2")).toBeNull();
  });

  it("reports a cancelled or failed login without saving anything", async () => {
    const first = createOAuthState("/settings/kroger");
    const denied = await call(`error=access_denied&state=${first.state}`, first.cookie);
    expect(denied.headers.get("location")).toBe(
      "http://localhost:3000/settings/kroger?kroger=denied",
    );

    exchangeCode.mockRejectedValue(new Error("invalid_grant"));
    const second = createOAuthState("/settings/kroger");
    const failed = await call(`code=stale&state=${second.state}`, second.cookie);
    expect(failed.headers.get("location")).toBe(
      "http://localhost:3000/settings/kroger?kroger=error",
    );
    expect(sessionCookie(denied)).toBeUndefined();
    expect(sessionCookie(failed)).toBeUndefined();
  });
});
