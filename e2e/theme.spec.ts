import { expect, test } from "@playwright/test";
import { newUser, signUp } from "./fixtures";

test("follows the machine until overridden, and the override survives a reload", async ({
  page,
}) => {
  await signUp(page, newUser());
  const html = page.locator("html");

  await page.emulateMedia({ colorScheme: "dark" });
  await expect(html).toHaveClass(/\bdark\b/);

  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(html).not.toHaveClass(/\bdark\b/);

  // The saved choice beats the machine.
  await page.reload();
  await expect(html).not.toHaveClass(/\bdark\b/);

  // Going back to the machine's setting clears the choice, so it follows the machine again.
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(html).toHaveClass(/\bdark\b/);
  await page.emulateMedia({ colorScheme: "light" });
  await expect(html).not.toHaveClass(/\bdark\b/);
});
