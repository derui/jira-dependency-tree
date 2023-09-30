import { test, expect } from "@playwright/test";

test("restore user information from cache", async ({ page }) => {
  page.goto("/");

  // type value and submit
  await page.getByTestId("user-configuration/opener").click();
  await page.getByTestId("user-configuration/form/user-domain").fill("domain");
  await page.getByTestId("user-configuration/form/email").fill("email");
  await page.getByTestId("user-configuration/form/token").fill("token");
  await page.getByTestId("user-configuration/form/submit").click();

  // wait to store cache
  await page.waitForTimeout(1000);

  // check restored
  page.reload();

  await page.getByTestId("user-configuration/opener").click();

  await expect(page.getByTestId("user-configuration/form/user-domain")).toHaveValue("domain");
  await expect(page.getByTestId("user-configuration/form/email")).toHaveValue("email");
  await expect(page.getByTestId("user-configuration/form/token")).toHaveValue("token");
});
