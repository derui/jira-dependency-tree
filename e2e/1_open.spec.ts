import { test, expect } from "@playwright/test";

test("open and initial display", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("sync-jira/button")).toHaveAttribute("disabled", "");
  await expect(page.getByTestId("user-configuration/opener")).not.toHaveClass(/--opened/);
  await expect(page.getByTestId("user-configuration/marker")).toHaveClass(/--show/);
  await expect(page.getByTestId("project-information/marker")).toHaveClass(/--show/);
  await expect(page.getByTestId("project-information/marker")).toHaveClass(/--show/);

  const name = page.getByTestId("project-information/name");
  await expect(name).toHaveClass(/--need-configuration/);
  await expect(name).toContainText("Click here");

  await expect(page.getByTestId("project-information/editor")).not.toHaveClass(/--opened/);
  await expect(page.getByTestId("zoom-slider/current-zoom")).toContainText("100%");

  // side toolbar

  await expect(page.getByTestId("side-toolbar/graph-layout")).not.toHaveClass(/--opened/);
  await expect(page.getByTestId("side-toolbar/horizontal")).toHaveClass(/--selected/);
  await expect(page.getByTestId("side-toolbar/vertical")).not.toHaveClass(/--selected/);
});
