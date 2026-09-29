import { describe, expect, it } from "vitest";
import { isPublicRoute, safeNextPath } from "./auth";

describe("safeNextPath", () => {
  it("keeps same-site paths", () => {
    expect(safeNextPath("/dashboard", "/fallback")).toBe("/dashboard");
    expect(safeNextPath("/plan?week=2", "/fallback")).toBe("/plan?week=2");
  });

  it.each([
    ["missing", undefined],
    ["empty", ""],
    ["an absolute URL", "https://evil.example"],
    ["a protocol-relative URL", "//evil.example"],
    ["a backslash trick", "/\\evil.example"],
    ["a relative path", "dashboard"],
  ])("falls back when next is %s", (_, next) => {
    expect(safeNextPath(next, "/fallback")).toBe("/fallback");
  });
});

describe("isPublicRoute", () => {
  it.each(["/", "/login", "/auth/confirm", "/auth/signout"])("%s is public", (path) => {
    expect(isPublicRoute(path)).toBe(true);
  });

  it.each(["/dashboard", "/plan", "/login-help", "/authors", "/settings/profile"])(
    "%s requires sign-in",
    (path) => {
      expect(isPublicRoute(path)).toBe(false);
    },
  );
});
