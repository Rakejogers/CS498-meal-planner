import type { Page } from "@playwright/test";
import { expect, signIn, signOut, test } from "./fixtures";

async function addMeal(page: Page, title: string, quantity: string, unit: string) {
  const form = page.getByRole("form", { name: "Add a meal", exact: true });
  if (!(await form.isVisible())) await page.getByText("Add a meal", { exact: true }).click();
  await form.getByLabel("Meal name", { exact: true }).fill(title);
  await form.getByLabel("Recipe serves", { exact: true }).fill("2");
  await form.getByLabel("Cooking for", { exact: true }).fill("4");
  await form.getByLabel("Ingredient 1", { exact: true }).fill("Rice");
  await form.getByLabel("Amount", { exact: true }).fill(quantity);
  await form.getByLabel("Unit", { exact: true }).fill(unit);
  await form.getByRole("button", { name: "Add to grocery list" }).click();
  await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
}

test("saved recipe requirements scale, combine, and update across sessions", async ({
  page,
  user,
}) => {
  void user;
  await page.getByRole("link", { name: "Build my grocery list" }).click();
  await expect(page).toHaveURL("/groceries");
  await addMeal(page, "Rice bowls", "100", "g");
  await addMeal(page, "Rice salad", "1/2", "kg");
  const requirements = page.getByRole("list", { name: "Combined grocery requirements" });
  await expect(requirements.getByRole("listitem")).toHaveCount(1);
  await expect(requirements).toContainText("1,200 g");
  await expect(requirements).toContainText("Rice bowls · Rice salad");
  await page.keyboard.press("Control+Home");
  await page.screenshot({
    path: test.info().outputPath("combined-grocery-list.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.keyboard.press("Control+Home");
  await page.screenshot({
    path: test.info().outputPath("combined-grocery-list-mobile.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 1280, height: 720 });

  // Real persistence, through the authenticated server action and RLS.
  await signOut(page);
  await signIn(page, user);
  await page.getByRole("link", { name: "Groceries", exact: true }).click();
  await expect(requirements).toContainText("1,200 g");

  const salad = page.getByLabel("Rice salad", { exact: true });
  await salad.getByRole("button", { name: "Included in list" }).click();
  await expect(requirements).toContainText("200 g");
  await expect(requirements).not.toContainText("Rice salad");
  await page.reload();
  await expect(requirements).toContainText("200 g");

  const bowls = page.getByLabel("Rice bowls", { exact: true });
  await bowls.getByText("Edit meal & ingredients").click();
  await bowls.getByLabel("Cooking for", { exact: true }).fill("2");
  await bowls.getByRole("button", { name: "Save meal", exact: true }).click();
  await expect(requirements).toContainText("100 g");
  await bowls.getByRole("button", { name: "Remove Rice bowls" }).click();
  await expect(requirements).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Rice bowls", exact: true })).toHaveCount(0);
});

test("the household default carries into grocery serving calculations", async ({ page, user }) => {
  void user;
  await page.goto("/settings/household");
  await page.getByRole("button", { name: "One more person" }).click();
  await page.getByRole("button", { name: "Save household" }).click();
  await expect(page.getByText("Saved.", { exact: false })).toBeVisible();
  await page.getByRole("link", { name: "Groceries", exact: true }).click();
  const form = page.getByRole("form", { name: "Add a meal", exact: true });
  await expect(form.getByLabel("Cooking for", { exact: true })).toHaveValue("3");
  await form.getByLabel("Recipe serves", { exact: true }).fill("2");
  await form.getByLabel("Meal name", { exact: true }).fill("Soup");
  await form.getByLabel("Ingredient 1", { exact: true }).fill("Stock");
  await form.getByLabel("Amount", { exact: true }).fill("500");
  await form.getByLabel("Unit", { exact: true }).fill("ml");
  await form.getByRole("button", { name: "Add to grocery list" }).click();
  await expect(page.getByRole("list", { name: "Combined grocery requirements" })).toContainText(
    "750 ml",
  );
});
