import { describe, expect, it } from "vitest";
import { googleAvatarUrl, isPublicRoute, safeNextPath } from "./auth";

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
    // URL parsing deletes tabs and newlines, so these become "//evil.example".
    ["a tab trick", "/\t/evil.example"],
    ["a newline trick", "/\n/evil.example"],
    ["a tab and backslash trick", "/\t\\evil.example"],
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

describe("googleAvatarUrl", () => {
  const photo = "https://lh3.googleusercontent.com/a/ACg8ocK=s96-c";

  it("reads Google's photo from avatar_url or picture", () => {
    expect(googleAvatarUrl({ avatar_url: photo })).toBe(photo);
    expect(googleAvatarUrl({ picture: photo })).toBe(photo);
  });

  // Anything else would make next/image throw on every signed-in page.
  it.each([
    ["no metadata", undefined],
    ["an email sign-up", { display_name: "Sam" }],
    ["another host", { avatar_url: "https://evil.example/a.png" }],
    ["a look-alike host", { avatar_url: "https://lh3.googleusercontent.com.evil.example/a" }],
    ["plain http", { avatar_url: "http://lh3.googleusercontent.com/a/x" }],
    ["a query string", { avatar_url: `${photo}?sz=1` }],
    ["not a URL", { avatar_url: "lh3.googleusercontent.com/a/x" }],
    ["not a string", { avatar_url: 42 }],
  ])("is null for %s", (_, metadata) => {
    expect(googleAvatarUrl(metadata)).toBeNull();
  });
});
