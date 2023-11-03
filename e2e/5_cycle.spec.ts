import { test, expect } from "@playwright/test";
import { inputCredential } from "./_support";

test("show cycle", async ({ page }) => {
  await page.goto("/");

  // Input credentials
  await inputCredential(page);

  // import issues
  await page.getByTestId("side-toolbar/importer-opener").click();
  await page.getByTestId("side-toolbar/importer/query-input/input").fill('project = "TES" ORDER BY created DESC');
  await page.getByTestId("side-toolbar/importer/query-input/button").click();
  await page.getByText("TES-54").click();
  await page.getByText("TES-52").click();
  await page.getByText("TES-51").click();

  await page.getByRole("button", { name: "Import 3 issues" }).click();
  await expect(page.getByRole("button", { name: "Select issues" })).toBeVisible();

  await page.getByTestId("side-toolbar/importer/close").click();

  expect(await page.getByTestId("issue-graph/issue-node/group").all()).toHaveLength(3);
});
