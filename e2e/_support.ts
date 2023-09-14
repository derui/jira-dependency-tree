import { Page } from "@playwright/test";

type Credentials = Readonly<{
  domain: string;
  email: string;
  token: string;
}>;

export const inputCredential = async function inputCredential(
  page: Page,
  cred: Credentials = {
    domain: "domain",
    email: "email",
    token: "token",
  },
) {
  // Input credentials
  await page.getByTestId("user-configuration/opener").click();
  await page.getByTestId("user-configuration/form/user-domain").fill(cred.domain);
  await page.getByTestId("user-configuration/form/email").fill(cred.email);
  await page.getByTestId("user-configuration/form/token").fill(cred.token);
  await page.getByTestId("user-configuration/form/submit").click();
};

export const importIssues = async function importIssues(page: Page, keys: string[] = ["TES-54", "TES-52", "TES-51"]) {
  await page.getByTestId("top-toolbar/importer-opener").click();

  // search issues with JQL
  await page.getByTestId("top-toolbar/importer/query-input/input").fill('project = "TES" ORDER BY created DESC');
  await page.getByTestId("top-toolbar/importer/query-input/button").click();

  const locator = page.getByTestId("top-toolbar/importer/root");

  // select issues and import
  for (const key of keys) {
    await locator.getByText(key).click();
  }

  await page.getByRole("button", { name: "Import 3 issues" }).click();

  await page.getByTestId("top-toolbar/importer/close").click();
};
