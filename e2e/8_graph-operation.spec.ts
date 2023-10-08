import { test, expect } from "@playwright/test";
import { importIssues, inputCredential } from "./_support";

test("view issue details in graph", async ({ page }) => {
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

  // click first issue
  const svg = page.getByTestId("issue-graph/root");
  await svg.hover();
  await page.mouse.move(300, 300, { steps: 5 });
  await page.mouse.down({ button: "right" });
  await page.mouse.move(600, 700, { steps: 5 });
  await page.mouse.up({ button: "right" });
  await page.getByTestId("issue-graph/issue-node/issue-TES-51/root").click();

  await expect(page.getByTestId("issue-graph/detail/issue-TES-51/key/item")).toContainText("TES-51");
  await expect(page.getByTestId("issue-graph/detail/issue-TES-51/summary/item")).toContainText("task 5");

  // close detail
  await page.getByTestId("issue-graph/detail/closer").click();
  await expect(page.getByTestId("issue-graph/detail/root")).not.toBeVisible();
});

test("remove issue from graph", async ({ page }) => {
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

  // click first issue
  const svg = page.getByTestId("issue-graph/root");
  await svg.hover();
  await page.mouse.move(300, 300, { steps: 5 });
  await page.mouse.down({ button: "right" });
  await page.mouse.move(600, 700, { steps: 5 });
  await page.mouse.up({ button: "right" });
  await page.getByTestId("issue-graph/issue-node/issue-TES-51/root").click();

  await expect(page.getByTestId("issue-graph/detail/issue-TES-51/key/item")).toContainText("TES-51");
  await expect(page.getByTestId("issue-graph/detail/issue-TES-51/summary/item")).toContainText("task 5");

  // close detail
  await page.getByText("Remove from graph").click();
  await expect(page.getByTestId("issue-graph/issue-node/issue-TES-51/root")).not.toBeVisible();
});
