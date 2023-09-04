import { test, expect, Page } from "@playwright/test";

const inputCredential = async function inputCredential(page: Page) {
  // Input credentials
  await page.getByTestId("user-configuration/opener").click();
  await page.getByTestId("user-configuration/form/user-domain").type("domain");
  await page.getByTestId("user-configuration/form/email").type("email");
  await page.getByTestId("user-configuration/form/token").type("token");
  await page.getByTestId("user-configuration/form/submit").click();
};

test("open importer", async ({ page }) => {
  await page.goto("/");

  await inputCredential(page);

  // open importer
  const importerButton = page.getByTestId("top-toolbar/importer-opener");
  const editorButton = page.getByTestId("top-toolbar/relation-editor-opener");

  await expect(importerButton).toHaveAttribute("aria-disabled", "false");
  await expect(editorButton).toHaveAttribute("aria-disabled", "false");

  await importerButton.click();

  await expect(importerButton).toHaveAttribute("aria-disabled", "true");
  await expect(editorButton).toHaveAttribute("aria-disabled", "true");
  await expect(page.getByTestId("top-toolbar/importer/query-input/input")).toHaveValue("");
  await expect(page.getByTestId("top-toolbar/importer/root")).toBeVisible();

  await expect(page.getByText("No issues")).toContainText("No issues. Please search with valid JQL first.");
  await expect(page.getByTestId("top-toolbar/importer/paginator/forward")).toHaveAttribute("aria-disabled", "true");
  await expect(page.getByTestId("top-toolbar/importer/paginator/backward")).toHaveAttribute("aria-disabled", "true");
  await expect(page.getByTestId("top-toolbar/importer/paginator/import")).toHaveAttribute("aria-disabled", "true");
});

test("input jql and import issues", async ({ page }) => {
  await page.routeFromHAR("./e2e/fixtures/normal.har", {
    url: "http://localhost:3000/**",
    update: false,
    updateMode: "minimal",
  });

  await page.goto("/");

  await inputCredential(page);

  // open importer
  const importerButton = page.getByTestId("top-toolbar/importer-opener");
  await importerButton.click();

  // search issues with JQL
  await page.getByTestId("top-toolbar/importer/query-input/input").type('project = "TES" ORDER BY created DESC');
  await page.getByTestId("top-toolbar/importer/query-input/button").click();

  await expect(page.getByTestId("top-toolbar/importer/paginator/forward")).toHaveAttribute("aria-disabled", "false");
  await expect(page.getByTestId("top-toolbar/importer/paginator/backward")).toHaveAttribute("aria-disabled", "true");
  await expect(page.getByTestId("top-toolbar/importer/paginator/import")).toHaveAttribute("aria-disabled", "true");

  // select issues and import
  await page.getByText("TES-54").click();
  await page.getByText("TES-52").click();
  await page.getByText("TES-51").click();

  await page.getByRole("button", { name: "Import 3 issues" }).click();
  await expect(page.getByRole("button", { name: "Import 3 issues" })).toBeVisible();

  await page.getByTestId("top-toolbar/importer/close").click();
  await expect(page.getByTestId("top-toolbar/importer/root")).not.toBeVisible();

  // verify issues in graph
  expect(await page.locator(".graph-issue").all()).toHaveLength(3);
});
