import { test, expect } from "@playwright/test";
import { importIssues, inputCredential } from "./_support";

const testidOf = function testidOf(id: string) {
  return `side-toolbar/relation-editor/${id}`;
};

test("view relations between imported issues", async ({ page }) => {
  page.goto("/");

  // Input credentials
  await inputCredential(page);

  // import issues
  await importIssues(page);

  // Open relation editor
  await page.getByTestId("side-toolbar/relation-editor-opener").click();
});

test("open and close panel", async ({ page }) => {
  await page.goto("/");

  // Open relation editor
  await page.getByTestId("side-toolbar/relation-editor-opener").click();

  // show only appender
  await expect(page.getByTestId("side-toolbar/relation-editor/panel/root")).toBeVisible();
  await expect(page.getByTestId("side-toolbar/relation-editor/appender/root")).toBeVisible();
  await expect(page.getByTestId("side-toolbar/relation-editor/draft/no-touched")).toHaveCount(0);

  // close relation editor
  await page.getByTestId("side-toolbar/relation-editor/panel/close").click();
  await expect(page.getByTestId("side-toolbar/relation-editor/panel/root")).toBeHidden();
});

test("append and remove relation", async ({ page }) => {
  page.goto("/");

  // Input credentials
  await inputCredential(page);

  // import issues
  await importIssues(page);

  // Open relation editor
  await page.getByTestId("side-toolbar/relation-editor-opener").click();

  // Check relation
  await expect(page.getByTestId(testidOf("draft/no-touched"))).toBeVisible();
  await expect(page.getByTestId(testidOf("draft/inward/root"))).toContainText("TES-51");
  await expect(page.getByTestId(testidOf("draft/outward/root"))).toContainText("TES-54");

  // Delete relation
  await page.getByTestId(testidOf("draft/arrow/deleter")).click();
  await expect(page.getByTestId(testidOf("draft/touched"))).toBeVisible();
  await expect(page.getByTestId(testidOf("draft/inward/root"))).toContainText("TES-51");
  await expect(page.getByTestId(testidOf("draft/outward/root"))).toContainText("TES-54");

  // append relation
  await page.getByTestId(testidOf("appender/root")).click();
  await page.getByTestId(testidOf("preparation/inward/select-root")).click();
  await page.getByTestId(testidOf("preparation/inward/select-root")).getByText("TES-52").click();
  await page.getByTestId(testidOf("preparation/outward/select-root")).click();
  await page.getByTestId(testidOf("preparation/outward/select-root")).getByText("TES-51").click();
  await page.getByTestId(testidOf("preparation/submit")).click();

  await expect(page.getByTestId(testidOf("draft/touched"))).toHaveCount(2);
  await expect(page.getByTestId(testidOf("draft/inward/root")).nth(1)).toContainText("TES-52");
  await expect(page.getByTestId(testidOf("draft/outward/root")).nth(1)).toContainText("TES-51");

  // Apply drafts
  await expect(page.getByRole("button", { name: "Apply drafts" })).toBeEnabled();
  await page.getByRole("button", { name: "Apply drafts" }).click();

  await expect(page.getByRole("button", { name: "Apply drafts" })).toBeDisabled();

  await expect(page.getByTestId(testidOf("draft/touched"))).toHaveCount(0);
  await expect(page.getByTestId(testidOf("draft/no-touched"))).toHaveCount(1);
  await expect(page.getByTestId(testidOf("draft/inward/root"))).toContainText("TES-52");
  await expect(page.getByTestId(testidOf("draft/outward/root"))).toContainText("TES-51");

  // reflect graph
  await expect(page.getByTestId(new RegExp("issue-graph/link-node/link-.+"))).toHaveCount(1);
});
