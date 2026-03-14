import { expect, test } from "@playwright/test";

test("redirects unauthenticated visitors to login and allows sign-in", async ({ page }) => {
  test.skip(
    !process.env.APP_LOGIN_USERNAME || !process.env.APP_LOGIN_PASSWORD,
    "Auth flow only runs when shared login env vars are configured."
  );

  await page.goto("/");
  await expect(page).toHaveURL(/\/login\?redirect=%2F$/);

  await page.getByLabel(/username/i).fill(process.env.APP_LOGIN_USERNAME!);
  await page.getByLabel(/password/i).fill(process.env.APP_LOGIN_PASSWORD!);
  await page.getByRole("button", { name: /sign in/i }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: /research literature search/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /log out of the app/i })).toBeVisible();
});
