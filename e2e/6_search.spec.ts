import { test, expect, Page } from "@playwright/test";
import { importIssues, inputCredential } from "./_support";

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
  await expect(page.getByTestId("issue-graph/issue-node/issue-TES-51/root")).toBeVisible();
});
