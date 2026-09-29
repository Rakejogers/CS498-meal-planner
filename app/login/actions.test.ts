import { beforeEach, describe, expect, it, vi } from "vitest";
import { signIn, signUp } from "./actions";

// Server actions are plain async functions, so they can be unit tested by
// mocking what they talk to: Supabase, request headers, and redirect().
//
// Only branches the e2e suite can't reach live here. Wrong passwords, sign-up,
// and the redirect back to `next` are covered end to end against real Supabase.
const auth = { signInWithPassword: vi.fn(), signUp: vi.fn() };

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth }),
}));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("next/navigation", () => ({
  // The real redirect() throws to stop the action; do the same.
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT ${path}`);
  }),
}));

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

beforeEach(() => {
  auth.signInWithPassword.mockReset();
  auth.signUp.mockReset();
});

describe("signIn", () => {
  it("never redirects off-site, whatever `next` says", async () => {
    auth.signInWithPassword.mockResolvedValue({ error: null });

    await expect(
      signIn({}, form({ email: "sam@example.com", password: "right", next: "//evil.example" })),
    ).rejects.toThrow("REDIRECT /dashboard");
  });
});

describe("signUp", () => {
  it("asks the user to confirm their email when Supabase returns no session", async () => {
    // Hosted projects have email confirmation on; local Supabase doesn't, so
    // the e2e suite never sees this branch.
    auth.signUp.mockResolvedValue({ data: { session: null }, error: null });

    const result = await signUp(
      {},
      form({ name: "Sam", email: "sam@example.com", password: "correct-horse" }),
    );

    expect(result.notice).toContain("sam@example.com");
    expect(result.error).toBeUndefined();
  });
});
