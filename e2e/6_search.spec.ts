import { test, expect, Page } from "@playwright/test";
import { importIssues, inputCredential } from "./_support";

test("allow search issue with term", async ({ page }) => {
  await page.routeFromHAR("./e2e/fixtures/normal.zip", {
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
  await page.getByLabel("issue-list").click();
  await page.getByPlaceholder("Filtering Issues").fill("54");

  // verify issues
  const panel = page.getByRole("dialog");
  expect(await panel.getByRole("listitem").count()).toBe(1);
});

test("move point to task if result clicked", async ({ page }) => {
  await page.routeFromHAR("./e2e/fixtures/normal.zip", {
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
  await page.getByLabel("issue-list").click();
  await page.getByPlaceholder("Filtering Issues").fill("TES-51");

  // make invisible target node
  const svg = page.getByTestId("issue-graph/root");
  await svg.hover();
  await page.mouse.move(300, 300, { steps: 5 });
  await page.mouse.down({ button: "right" });
  await page.mouse.move(0, 100, { steps: 5 });
  await page.mouse.up({ button: "right" });

  // move to issue
  await page.getByRole("dialog").getByRole("listitem").click();

  // verify
  await expect(page.getByTestId("issue-graph/issue-node/issue-TES-51/root")).toBeInViewport();
});
