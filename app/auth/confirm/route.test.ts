// @vitest-environment node
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

// Email confirmation is off on local Supabase, so no e2e test reaches this
// route. Unit test the branches instead.
const auth = { exchangeCodeForSession: vi.fn(), verifyOtp: vi.fn() };

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth }),
}));

const call = (query: string) => GET(new NextRequest(`http://localhost:3000/auth/confirm?${query}`));

beforeEach(() => {
  auth.exchangeCodeForSession.mockReset();
  auth.verifyOtp.mockReset();
});

describe("GET /auth/confirm", () => {
  it("verifies the emailed token, then continues to a same-site `next` only", async () => {
    auth.verifyOtp.mockResolvedValue({ error: null });

    const ok = await call("token_hash=abc&type=signup&next=/plan");
    expect(auth.verifyOtp).toHaveBeenCalledWith({ type: "signup", token_hash: "abc" });
    expect(ok.headers.get("location")).toBe("http://localhost:3000/plan");

    const offSite = await call("token_hash=abc&type=signup&next=//evil.example");
    expect(offSite.headers.get("location")).toBe("http://localhost:3000/dashboard");
  });

  it("sends the user back to log in when the link is missing its token or Supabase rejects it", async () => {
    const missing = await call("next=/plan");
    expect(missing.headers.get("location")).toBe("http://localhost:3000/login?error=confirm");
    expect(auth.verifyOtp).not.toHaveBeenCalled();

    auth.verifyOtp.mockResolvedValue({ error: new Error("Token has expired") });
    const rejected = await call("token_hash=stale&type=signup");
    expect(rejected.headers.get("location")).toBe("http://localhost:3000/login?error=confirm");
  });
});
