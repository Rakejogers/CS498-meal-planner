// @vitest-environment node
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

// The Google round trip can't run in e2e, so unit test where it lands.
const auth = { exchangeCodeForSession: vi.fn() };

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth }),
}));

const call = (query: string) =>
  GET(new NextRequest(`http://localhost:3000/auth/callback?${query}`));

beforeEach(() => auth.exchangeCodeForSession.mockReset());

describe("GET /auth/callback", () => {
  it("exchanges the code, then continues to a same-site `next` only", async () => {
    auth.exchangeCodeForSession.mockResolvedValue({ error: null });

    const ok = await call("code=abc&next=/plan");
    expect(auth.exchangeCodeForSession).toHaveBeenCalledWith("abc");
    expect(ok.headers.get("location")).toBe("http://localhost:3000/plan");

    const offSite = await call("code=abc&next=//evil.example");
    expect(offSite.headers.get("location")).toBe("http://localhost:3000/dashboard");
  });

  it("sends the user back to log in when they cancel on Google or the code is rejected", async () => {
    const cancelled = await call("error=access_denied&next=/plan");
    expect(cancelled.headers.get("location")).toBe("http://localhost:3000/login?error=google");
    expect(auth.exchangeCodeForSession).not.toHaveBeenCalled();

    auth.exchangeCodeForSession.mockResolvedValue({ error: new Error("invalid grant") });
    const rejected = await call("code=stale");
    expect(rejected.headers.get("location")).toBe("http://localhost:3000/login?error=google");
  });
});
