import { test, expect } from "@playwright/test";
import { importIssues, inputCredential } from "./_support";

test("view relations between imported issues", async ({ page }) => {
  await page.routeFromHAR("./e2e/fixtures/relation-editor.har", {
    url: "http://localhost:3000/**",
    update: true,
    updateMode: "minimal",
  });

  page.goto("/");

  // Input credentials
  await inputCredential(page);

  // import issues
  await importIssues(page);

  // Open relation editor
  await page.getByTestId("top-toolbar/relation-editor-opener").click();
});

test("open and close panel", async ({ page }) => {
  await page.goto("/");

  // Open relation editor
  await page.getByTestId("top-toolbar/relation-editor-opener").click();

  // show only appender
  await expect(page.getByTestId("top-toolbar/relation-editor/panel/root")).toBeVisible();
  await expect(page.getByTestId("top-toolbar/relation-editor/appender/root")).toBeVisible();
  expect(await page.getByTestId("top-toolbar/relation-editor/draft/no-touched").all()).toHaveLength(0);

  // close relation editor
  await page.getByTestId("top-toolbar/relation-editor/panel/close").click();
  await expect(page.getByTestId("top-toolbar/relation-editor/panel/root")).toBeHidden();
});
