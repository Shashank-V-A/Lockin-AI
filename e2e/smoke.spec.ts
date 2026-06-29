import { test, expect } from "@playwright/test";

test.describe("public routes", () => {
  test("landing page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Lockin/i);
    await expect(page.getByRole("button", { name: /continue with google/i }).first()).toBeVisible();
  });
});

test.describe("edge auth proxy", () => {
  test("dashboard redirects when unauthenticated", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL("/");
  });

  test("coding redirects when unauthenticated", async ({ page }) => {
    await page.goto("/coding");
    await expect(page).toHaveURL("/");
  });

  test("coach redirects when unauthenticated", async ({ page }) => {
    await page.goto("/coach");
    await expect(page).toHaveURL("/");
  });
});
