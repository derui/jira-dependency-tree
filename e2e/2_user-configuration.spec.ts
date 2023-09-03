import { test, expect } from "@playwright/test";

test("open editor and apply state", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("user-configuration/opener").click();

  // initial is disabled
  const submit = page.getByTestId("user-configuration/form/submit");
  await expect(submit).toHaveAttribute("aria-disabled", "true");

  const userDomain = page.getByTestId("user-configuration/form/user-domain");
  const email = page.getByTestId("user-configuration/form/email");
  const token = page.getByTestId("user-configuration/form/token");

  await userDomain.type("domain");
  await email.type("email");
  await token.type("token");
  await expect(userDomain).toHaveValue("domain");
  await expect(email).toHaveValue("email");
  await expect(token).toHaveValue("token");

  // should not be disabled when all fields are filled
  await expect(submit).not.toBeDisabled();
  await submit.click();

  // closed dialog automatically and marker is hidden
  await expect(page.getByTestId("user-configuration/opener")).not.toHaveClass("--opened");
  await expect(page.getByTestId("user-configuration/marker")).not.toHaveClass("--showed");

  // still sync jira button is disabled
  await expect(page.getByTestId("sync-issue-button/button")).not.toBeDisabled();
});

test("restore state when reopened", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("user-configuration/opener").click();

  // initial is disabled
  const submit = page.getByTestId("user-configuration/form/submit");
  await expect(submit).toHaveAttribute("aria-disabled", "true");

  const userDomain = page.getByTestId("user-configuration/form/user-domain");
  const email = page.getByTestId("user-configuration/form/email");
  const token = page.getByTestId("user-configuration/form/token");

  await userDomain.type("domain");
  await email.type("email");
  await token.type("token");
  await submit.click();

  await page.getByTestId("user-configuration/opener").click();

  // all state is same on last state
  await expect(page.getByTestId("user-configuration/form/user-domain")).toHaveValue("domain");
  await expect(page.getByTestId("user-configuration/form/email")).toHaveValue("email");
  await expect(page.getByTestId("user-configuration/form/token")).toHaveValue("token");
});
