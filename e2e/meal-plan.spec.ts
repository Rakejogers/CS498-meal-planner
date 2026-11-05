import { expect, test } from "./fixtures";

test("users can plan their week, keep it, and swap in different dinners", async ({
  page,
  user,
}) => {
  // A reused `npm run dev` server plans with the real model, which takes longer.
  test.slow();
  const generated = { timeout: 60_000 };
  await expect(page.getByRole("heading", { name: `Hi ${user.name}.` })).toBeVisible();

  await page.getByRole("button", { name: "Plan my week" }).click();

  const dinners = page.getByRole("list", { name: "Dinners this week" }).getByRole("listitem");
  await expect(dinners).toHaveCount(4, generated);
  // New accounts cook for two.
  await expect(dinners.first()).toContainText("Serves 2");
  await expect(dinners.first()).toContainText(/\d+ min/);
  const firstDinner = await dinners.first().getByRole("heading").innerText();

  // The plan is saved, not just on screen.
  await page.reload();
  await expect(dinners).toHaveCount(4);

  // Asking for more swaps in different dinners rather than adding to the plan.
  await page.getByRole("button", { name: "Plan more dinners" }).click();
  await expect(dinners.first().getByRole("heading")).not.toHaveText(firstDinner, generated);
  await expect(dinners).toHaveCount(4);
});
