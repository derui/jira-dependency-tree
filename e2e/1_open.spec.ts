import { test, expect } from "@playwright/test";

test("open and initial display", async ({ page }) => {
  await page.goto("/");

  const button = page.getByTestId("sync-issue-button/button");
  await button.waitFor();
  await expect(button).toBeDisabled();
  await expect(page.getByTestId("user-configuration/opener")).not.toHaveClass("opened");
  await expect(page.getByTestId("user-configuration/marker")).toHaveAttribute("aria-hidden", "false");
  await expect(page.getByTestId("zoom-slider/current-zoom")).toContainText("100%");
  await expect(page.getByTestId("top-toolbar/importer-opener")).toHaveAttribute("aria-disabled", "false");
  await expect(page.getByTestId("top-toolbar/relation-editor-opener")).toHaveAttribute("aria-disabled", "false");

  // side toolbar
  await expect(page.getByTestId("side-toolbar/graph-layouter/graph-layout")).not.toHaveClass("--opened");
  await expect(page.getByTestId("side-toolbar/graph-layouter/graph-layout")).toHaveAttribute(
    "data-layout",
    "horizontal",
  );

  await expect(page.getByTestId("side-toolbar/graph-unroller/unroller")).toHaveAttribute("aria-disabled", "true");

  // searcher
  await expect(page.getByTestId("issue-searcher/input/opener")).toBeVisible();
  await expect(page.getByTestId("issue-searcher/input/cancel")).toBeVisible();
});
