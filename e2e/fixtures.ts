import { test as base, expect, type Page } from "@playwright/test";

export type TestUser = { name: string; email: string; password: string };

/** A brand-new user. Local Supabase confirms sign-ups instantly. */
export function newUser(): TestUser {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return { name: "Sam", email: `e2e-${id}@example.com`, password: "correct-horse-battery" };
}

export async function signUp(page: Page, user: TestUser) {
  await page.goto("/login?mode=signup");
  await page.getByLabel("First name").fill(user.name);
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password", { exact: true }).fill(user.password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL("/dashboard");
}

export async function signIn(page: Page, user: TestUser) {
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password", { exact: true }).fill(user.password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

/**
 * Use `test` from this file to get a `user` fixture: a fresh account that is
 * already signed in on `page`.
 */
export const test = base.extend<{ user: TestUser }>({
  user: async ({ page }, use) => {
    const user = newUser();
    await signUp(page, user);
    await use(user);
  },
});

export { expect };
