import { expect, test } from "./fixtures";

test("the week is as many dinners as the user asked for, and the grocery list covers them", async ({
  page,
  user,
}) => {
  void user;
  // A reused `npm run dev` server plans with the real model, which takes longer.
  test.slow();
  const generated = { timeout: 60_000 };

  await page.goto("/groceries");
  await expect(page.getByRole("heading", { name: "Plan your week first." })).toBeVisible();

  await page.goto("/settings/household");
  await page.getByRole("radio", { name: "2 dinners" }).check();
  await page.getByRole("button", { name: "Save household" }).click();
  await expect(page.getByText("Saved.")).toBeVisible();

  await page.getByRole("link", { name: "Your week" }).click();
  await page.getByRole("button", { name: "Plan my week" }).click();
  const dinners = page.getByRole("list", { name: "Dinners this week" }).getByRole("listitem");
  await expect(dinners).toHaveCount(2, generated);
  const titles = await dinners.getByRole("heading").allInnerTexts();

  await page.getByRole("link", { name: "Grocery list" }).click();
  await expect(page).toHaveURL("/groceries");
  await expect(page.getByRole("checkbox").first()).toBeVisible();
  const key = page.getByRole("list", { name: "This week's dinners" });
  for (const title of titles) await expect(key).toContainText(title);
});
