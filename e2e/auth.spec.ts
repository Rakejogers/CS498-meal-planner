import { expect, newUser, signIn, signOut, signUp, test } from "./fixtures";

test("sign up, sign out, and sign back in", async ({ page }) => {
  const user = newUser();

  await signUp(page, user);
  await expect(page.getByRole("heading", { name: `Hi ${user.name}.` })).toBeVisible();

  await signOut(page);
  await expect(page).toHaveURL("/login");

  await signIn(page, user);
  await expect(page).toHaveURL("/dashboard");
  await expect(page.getByRole("heading", { name: `Hi ${user.name}.` })).toBeVisible();
});

test("wrong password shows an error", async ({ page }) => {
  await page.goto("/login");
  await signIn(page, { ...newUser(), password: "not-the-password" });

  // Scoped to the form: Next's route announcer is also a role="alert".
  await expect(page.locator("form").getByRole("alert")).toHaveText(
    "That email and password don't match.",
  );
});

test("signed-out visitors are sent to log in, then back", async ({ page }) => {
  const user = newUser();
  await signUp(page, user);
  await signOut(page);

  await page.goto("/dashboard");
  await expect(page).toHaveURL("/login?next=%2Fdashboard");

  await signIn(page, user);
  await expect(page).toHaveURL("/dashboard");
});

test("signed-in users skip the log-in page", async ({ page, user }) => {
  await page.goto("/login");

  await expect(page).toHaveURL("/dashboard");
  await expect(page.getByText(user.name, { exact: true })).toBeVisible();
});
