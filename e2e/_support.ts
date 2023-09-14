import { Page } from "@playwright/test";

export const inputCredential = async function inputCredential(page: Page) {
  // Input credentials
  await page.getByTestId("user-configuration/opener").click();
  await page.getByTestId("user-configuration/form/user-domain").fill("domain");
  await page.getByTestId("user-configuration/form/email").fill("email");
  await page.getByTestId("user-configuration/form/token").fill("token");
  await page.getByTestId("user-configuration/form/submit").click();
};

export const importIssues = async function importIssues(page: Page) {
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
