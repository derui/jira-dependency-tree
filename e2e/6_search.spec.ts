import { test, expect, Page } from "@playwright/test";

const inputCredential = async function inputCredential(page: Page) {
  // Input credentials
  await page.getByTestId("user-configuration/opener").click();
  await page.getByTestId("user-configuration/form/user-domain").fill("domain");
  await page.getByTestId("user-configuration/form/email").fill("email");
  await page.getByTestId("user-configuration/form/token").fill("token");
  await page.getByTestId("user-configuration/form/submit").click();
};

const importIssues = async function importIssues(page: Page) {
  await page.getByTestId("top-toolbar/importer-opener").click();

  // search issues with JQL
  await page.getByTestId("top-toolbar/importer/query-input/input").fill('project = "TES" ORDER BY created DESC');
  await page.getByTestId("top-toolbar/importer/query-input/button").click();

  // select issues and import
  await page.getByText("TES-54").click();
  await page.getByText("TES-52").click();
  await page.getByText("TES-51").click();

  await page.getByRole("button", { name: "Import 3 issues" }).click();

  await page.getByTestId("top-toolbar/importer/close").click();
};

test("allow search issue with term", async ({ page }) => {
  await page.routeFromHAR("./e2e/fixtures/normal.har", {
    url: "http://localhost:3000/**",
    update: false,
    updateMode: "minimal",
  });

  await page.goto("/");

  // Input credentials
  await inputCredential(page);

  // import issues
  await importIssues(page);

  // open and input issue searching term
  await expect(page.getByTestId("issue-searcher/input/cancel")).not.toBeVisible();
  await page.getByTestId("issue-searcher/input/opener").click();
  await page.getByTestId("issue-searcher/input/input").fill("TES");
  await page.getByTestId("issue-searcher/input/input").press("Enter");

  // verify issues
  expect(await page.getByTestId("issue-searcher/issue/root").all()).toHaveLength(3);
});

test("Do cancel to close searcher", async ({ page }) => {
  await page.goto("/");

  await page.routeFromHAR("./e2e/fixtures/normal.har", {
    url: "http://localhost:3000/**",
    update: false,
    updateMode: "minimal",
  });

  // Input credentials
  await inputCredential(page);

  // import issues
  await importIssues(page);

  // open and input issue searching term
  await expect(page.getByTestId("issue-searcher/input/cancel")).not.toBeVisible();
  await page.getByTestId("issue-searcher/input/opener").click();
  await page.getByTestId("issue-searcher/input/input").fill("TES");
  await page.getByTestId("issue-searcher/input/input").press("Enter");

  // verify issues
  await page.getByTestId("issue-searcher/input/cancel").click();
  await expect(page.getByTestId("issue-searcher/input/input")).not.toBeVisible();
  await expect(page.getByTestId("issue-searcher/input/input")).toHaveValue("");
});

test("move point to task if result clicked", async ({ page }) => {
  await page.routeFromHAR("./e2e/fixtures/normal.har", {
    url: "http://localhost:3000/**",
    update: false,
    updateMode: "minimal",
  });

  await page.goto("/");

  // Input credentials
  await inputCredential(page);

  // import issues
  await importIssues(page);

  // open and input issue searching term
  await expect(page.getByTestId("issue-searcher/input/cancel")).not.toBeVisible();
  await page.getByTestId("issue-searcher/input/opener").click();
  await page.getByTestId("issue-searcher/input/input").fill("TES-51");
  await page.getByTestId("issue-searcher/input/input").press("Enter");

  // move to issue
  await page.getByTestId("issue-searcher/issue/root").click();

  // verify
  await expect(page.locator('[data-issue-key="TES-51"]')).toBeVisible();
});
