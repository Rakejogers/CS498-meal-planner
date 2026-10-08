import { createAccount, expect, newUser, test } from "./fixtures";

test("new users set food preferences during onboarding and can change them in settings", async ({
  page,
}) => {
  const user = newUser();
  await createAccount(page, user);

  // The rest of the app waits until setup is finished or skipped.
  await page.goto("/dashboard");
  await expect(page).toHaveURL("/onboarding");

  await page.getByRole("button", { name: "Vegetarian" }).click();
  await page.getByLabel("Foods you can't eat").fill("Peanuts");
  await page.getByLabel("Foods you can't eat").press("Enter");
  await page.getByLabel("Foods you love").fill("pasta");
  await page.getByLabel("Foods you love").press("Enter");
  await page.getByRole("button", { name: "Start planning" }).click();

  await expect(page).toHaveURL("/dashboard");
  await expect(page.getByRole("heading", { name: `Hi ${user.name}.` })).toBeVisible();

  // Onboarding only happens once.
  await page.goto("/onboarding");
  await expect(page).toHaveURL("/dashboard");

  await page.getByRole("link", { name: "Settings" }).click();
  await expect(page).toHaveURL("/settings/preferences");
  await expect(page.getByRole("button", { name: "Vegetarian" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByRole("button", { name: "Remove peanuts" })).toBeVisible();

  // Changing your mind: a loved food that turns out to be off the table moves lists.
  await page.getByLabel("Foods you can't eat").fill("pasta");
  await page.getByLabel("Foods you can't eat").press("Enter");
  await page.getByLabel("Foods you'd rather skip").fill("olives");
  await page.getByLabel("Foods you'd rather skip").press("Enter");
  await page.getByRole("button", { name: "Save preferences" }).click();
  await expect(page.getByRole("status")).toContainText("Saved");

  await page.reload();
  await expect(page.getByRole("button", { name: "Remove olives" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Remove pasta" })).toHaveCount(1);
});
