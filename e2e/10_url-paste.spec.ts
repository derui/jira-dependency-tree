import { test, expect } from "@playwright/test";
import { inputCredential } from "./_support";

test("paste JIRA issue and load it", async ({ page }) => {
  await page.goto("/");

  await inputCredential(page);

  // paste URL
  await page.locator("body").evaluate((el) => {
    const clipboardData = new DataTransfer();
    clipboardData.setData("text/plain", "https://domain.atlassian.net/browse/TES-9");
    const clipboardEvent = new ClipboardEvent("paste", {
      clipboardData,
    });
    el.dispatchEvent(clipboardEvent);
  });

  await expect(page.getByRole("listitem")).toContainText("TES-9");
});
