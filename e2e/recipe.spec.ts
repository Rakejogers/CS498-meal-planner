import { expect, test } from "./fixtures";

test("a planned dinner opens to its full recipe", async ({ page, user }) => {
  void user;
  // A reused `npm run dev` server plans with the real model, which takes longer.
  test.slow();

  await page.getByRole("button", { name: "Plan my week" }).click();
  const dinners = page.getByRole("list", { name: "Dinners this week" }).getByRole("listitem");
  await expect(dinners.first()).toBeVisible({ timeout: 60_000 });
  const second = dinners.nth(1);
  const title = await second.getByRole("heading").innerText();

  await second.getByRole("link", { name: title }).click();
  await expect(page).toHaveURL(/\/meals\/[0-9a-f-]{36}$/);
  await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
  await expect(page.getByText("Dinner 2 ·")).toBeVisible();
  await expect(page.getByText("Serves 2")).toBeVisible();
  await expect(page.getByText(/^\d+ min$/)).toBeVisible();
  await expect(
    page.getByRole("list", { name: "Ingredients" }).getByRole("listitem").first(),
  ).toBeVisible();
  await expect(
    page.getByRole("list", { name: "Steps" }).getByRole("listitem").first(),
  ).toBeVisible();

  // Links to dinners that don't exist, or aren't ids at all, show a not-found page.
  for (const id of ["not-a-meal", crypto.randomUUID()]) {
    await page.goto(`/meals/${id}`);
    await expect(
      page.getByRole("heading", { name: "We couldn't find that dinner." }),
    ).toBeVisible();
  }
});
