import { test, expect } from "@playwright/test";
import { inputCredential } from "./_support";

test("open importer", async ({ page }) => {
  await page.goto("/");

  await inputCredential(page);

  // open importer
  const importerButton = page.getByTestId("side-toolbar/importer-opener");
  const editorButton = page.getByTestId("side-toolbar/relation-editor-opener");

  await expect(importerButton).toBeEnabled();
  await expect(editorButton).toBeEnabled();

  await importerButton.click();

  await expect(importerButton).toBeDisabled();
  await expect(editorButton).toBeDisabled();
  await expect(page.getByTestId("side-toolbar/importer/query-input/input")).toHaveValue("");
  await expect(page.getByTestId("side-toolbar/importer/root")).toBeVisible();

  await expect(page.getByText("No issues")).toContainText("No issues. Please search with valid JQL first.");
  await expect(page.getByTestId("side-toolbar/importer/paginator/forward")).toBeEnabled();
  await expect(page.getByTestId("side-toolbar/importer/paginator/backward")).toBeDisabled();
  await expect(page.getByTestId("side-toolbar/importer/paginator/import")).toBeDisabled();
});

test("input jql and import issues", async ({ page }) => {
  await page.routeFromHAR("./e2e/fixtures/normal.zip", {
    url: "http://localhost:3000/**",
    update: false,
    updateMode: "minimal",
  });

  await page.goto("/");

  await inputCredential(page);

  // open importer
  const importerButton = page.getByTestId("side-toolbar/importer-opener");
  await importerButton.click();

  // search issues with JQL
  await page.getByTestId("side-toolbar/importer/query-input/input").fill('project = "TES" ORDER BY created DESC');
  await page.getByTestId("side-toolbar/importer/query-input/button").click();

  await expect(page.getByTestId("side-toolbar/importer/paginator/forward")).toBeEnabled();
  await expect(page.getByTestId("side-toolbar/importer/paginator/backward")).toBeDisabled();
  await expect(page.getByTestId("side-toolbar/importer/paginator/import")).toBeDisabled();

  // select issues and import
  await page.getByText("TES-54").click();
  await page.getByText("TES-52").click();
  await page.getByText("TES-51").click();

  await page.getByRole("button", { name: "Import 3 issues" }).click();
  const resettedButton = page.getByRole("button", { name: "Select issues" });
  await expect(resettedButton).toBeVisible();
  await expect(resettedButton).toBeDisabled();

  await page.getByTestId("side-toolbar/importer/close").click();
  await expect(page.getByTestId("side-toolbar/importer/root")).not.toBeVisible();

  // verify issues in graph
  expect(await page.getByTestId("issue-graph/issue-node/group").all()).toHaveLength(3);
});
