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

  test("coach stream API returns 401 when unauthenticated", async ({ request }) => {
    const res = await request.post("/api/coach/stream", {
      data: { message: "hello" },
    });
    expect(res.status()).toBe(401);
  });

  test("resume status API returns 401 when unauthenticated", async ({ request }) => {
    const res = await request.get("/api/resume/status?id=test");
    expect(res.status()).toBe(401);
  });
});
