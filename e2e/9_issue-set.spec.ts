import { test, expect } from "@playwright/test";
import { importIssues, inputCredential } from "./_support";

test("view issue set", async ({ page }) => {
  await page.routeFromHAR("./e2e/fixtures/normal.zip", {
    url: "http://localhost:3000/**",
    update: false,
    updateMode: "minimal",
  });

  page.goto("/");

  // open issue set
  await page.getByTestId("issue-set/opener").click();

  // View default issue set
  await expect(page.getByTestId("issue-set/issue-set/name")).toContainText("Default");

  // Close modal
  await page.getByTestId("issue-set/modal/closer").click();

  await expect(page.getByTestId("issue-set/modal/modal")).not.toBeVisible();
});

test("create, rename, delete issue set", async ({ page }) => {
  await page.routeFromHAR("./e2e/fixtures/normal.zip", {
    url: "http://localhost:3000/**",
    update: false,
    updateMode: "minimal",
  });

  page.goto("/");

  // open issue set
  await page.getByTestId("issue-set/opener").click();

  // View default issue set
  await page.getByTestId("issue-set/creator/button").click();
  await page.getByTestId("issue-set/creator/editor/input").fill("new one");
  await page.keyboard.press("Enter");

  // Expect an issue set appended
  expect(await page.getByTestId("issue-set/issue-set/name").count()).toEqual(2);
  await expect(page.getByTestId("issue-set/issue-set/name").filter({ hasText: "new one" })).toBeVisible();

  // rename Default
  await page
    .getByTestId("issue-set/issue-set/root")
    .filter({ hasText: "Default" })
    .getByTestId("issue-set/issue-set/rename-requester")
    .click();
  await page.getByTestId("issue-set/renamer/input").fill("renamed");
  await page.getByTestId("issue-set/renamer/submit").click();

  // Expect renamed
  expect(await page.getByTestId("issue-set/issue-set/name").count()).toEqual(2);
  await expect(page.getByTestId("issue-set/issue-set/name").filter({ hasText: "renamed" })).toBeVisible();

  // select new one
  await page.getByTestId("issue-set/issue-set/name").filter({ hasText: "new one" }).click();

  // delete renamed
  const roots = page.getByTestId("issue-set/issue-set/root");
  const targetRoot = roots.filter({ hasText: "renamed" });
  await targetRoot.getByTestId("issue-set/issue-set/delete-requester").click();

  await expect(targetRoot.getByTestId("issue-set/issue-set/delete-confirm")).toBeVisible();
  await targetRoot.getByTestId("issue-set/issue-set/delete-confirm").click();

  // expect deleted issue set
  await expect(roots).toHaveCount(1);
  await expect(targetRoot).toHaveCount(0);

  // contains selected issue set name
  await page.getByTestId("issue-set/modal/closer").click();

  await expect(page.getByTestId("issue-set/opener")).toContainText("new one");
});

test("restore issue set", async ({ page }) => {
  await page.routeFromHAR("./e2e/fixtures/normal.zip", {
    url: "http://localhost:3000/**",
    update: false,
    updateMode: "minimal",
  });

  page.goto("/");

  // Input credentials
  await inputCredential(page);

  // import issues
  await importIssues(page);

  // open issue set
  await page.getByTestId("issue-set/opener").click();

  // rename Default
  await page
    .getByTestId("issue-set/issue-set/root")
    .filter({ hasText: "Default" })
    .getByTestId("issue-set/issue-set/rename-requester")
    .click();
  await page.getByTestId("issue-set/renamer/input").fill("renamed");
  await page.getByTestId("issue-set/renamer/submit").click();

  // wait for storing cache
  await page.waitForTimeout(1000);
  await page.reload();

  // expect restored data
  await expect(page.getByTestId("issue-set/opener")).toContainText("renamed");
  await expect(page.getByTestId("issue-graph/issue-node/issue-TES-54/root")).toBeVisible();
  await expect(page.getByTestId("issue-graph/issue-node/issue-TES-52/root")).toBeVisible();
  await expect(page.getByTestId("issue-graph/issue-node/issue-TES-51/root")).toBeVisible();

  // Expect to be able to re-sync issues in set
  const waitForResponse = page.waitForResponse(async (r) => {
    return r.url().includes("get-issues") && r.status() == 200;
  });
  await page.getByTestId("sync-issue-button/button").click();
  await waitForResponse;

  await expect(page.getByTestId("sync-issue-button/root")).toHaveAttribute("data-syncing", "false");
  await expect(page.getByTestId("issue-graph/issue-node/issue-TES-54/root")).toBeVisible();
  await expect(page.getByTestId("issue-graph/issue-node/issue-TES-52/root")).toBeVisible();
  await expect(page.getByTestId("issue-graph/issue-node/issue-TES-51/root")).toBeVisible();
});
