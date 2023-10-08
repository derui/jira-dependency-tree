import { test, expect } from "@playwright/test";
import { inputCredential } from "./_support";

test("open importer", async ({ page }) => {
  await page.goto("/");

  await inputCredential(page);

  // open importer
  const importerButton = page.getByTestId("side-toolbar/importer-opener");
  const editorButton = page.getByTestId("side-toolbar/relation-editor-opener");

  await expect(importerButton).toHaveAttribute("aria-disabled", "false");
  await expect(editorButton).toHaveAttribute("aria-disabled", "false");

  await importerButton.click();

  await expect(importerButton).toHaveAttribute("aria-disabled", "true");
  await expect(editorButton).toHaveAttribute("aria-disabled", "true");
  await expect(page.getByTestId("side-toolbar/importer/query-input/input")).toHaveValue("");
  await expect(page.getByTestId("side-toolbar/importer/root")).toBeVisible();

  await expect(page.getByText("No issues")).toContainText("No issues. Please search with valid JQL first.");
  await expect(page.getByTestId("side-toolbar/importer/paginator/forward")).toHaveAttribute("aria-disabled", "false");
  await expect(page.getByTestId("side-toolbar/importer/paginator/backward")).toHaveAttribute("aria-disabled", "true");
  await expect(page.getByTestId("side-toolbar/importer/paginator/import")).toHaveAttribute("aria-disabled", "true");
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

  await expect(page.getByTestId("side-toolbar/importer/paginator/forward")).toHaveAttribute("aria-disabled", "false");
  await expect(page.getByTestId("side-toolbar/importer/paginator/backward")).toHaveAttribute("aria-disabled", "true");
  await expect(page.getByTestId("side-toolbar/importer/paginator/import")).toHaveAttribute("aria-disabled", "true");

  // select issues and import
  await page.getByText("TES-54").click();
  await page.getByText("TES-52").click();
  await page.getByText("TES-51").click();

  await page.getByRole("button", { name: "Import 3 issues" }).click();
  await expect(page.getByRole("button", { name: "Import 3 issues" })).toBeVisible();

  await page.getByTestId("side-toolbar/importer/close").click();
  await expect(page.getByTestId("side-toolbar/importer/root")).not.toBeVisible();

  // verify issues in graph
  expect(await page.getByTestId("issue-graph/issue-node/group").all()).toHaveLength(3);
});
