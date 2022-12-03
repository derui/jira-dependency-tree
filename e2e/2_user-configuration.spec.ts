import { test, expect } from "@playwright/test";

test("open editor and apply state", async ({ page }) => {
  await page.goto("/");

  const opener = page.getByTestId("user-configuration/opener");
  await opener.click();
  await expect(opener).toHaveClass(/--opened/);

  // initial is disabled
  const submit = page.getByTestId("user-configuration/dialog/submit");
  await expect(submit).toHaveAttribute("disabled", "");
  await page.getByTestId("user-configuration/dialog/user-domain").type("domain");
  await page.getByTestId("user-configuration/dialog/email").type("email");
  await page.getByTestId("user-configuration/dialog/jira-token").type("token");

  // should not be disabled when all fields are filled
  await expect(submit).not.toHaveAttribute("disabled", "");
  await submit.click();

  // closed dialog automatically and marker is hidden
  await expect(page.getByTestId("user-configuration/opener")).not.toHaveClass(/--opened/);
  await expect(page.getByTestId("user-configuration/marker")).not.toHaveClass(/--showed/);

  // still sync jira button is disabled
  await expect(page.getByTestId("sync-jira/button")).toHaveAttribute("disabled", "");
});

test("restore state when reopened", async ({ page }) => {
  await page.goto("/");

  const opener = page.getByTestId("user-configuration/opener");

  await opener.click();
  await page.getByTestId("user-configuration/dialog/user-domain").type("domain");
  await page.getByTestId("user-configuration/dialog/email").type("email");
  await page.getByTestId("user-configuration/dialog/jira-token").type("token");
  await page.getByTestId("user-configuration/dialog/submit").click();

  await page.getByTestId("user-configuration/opener").click();

  // all state is same on last state
  await expect(page.getByTestId("user-configuration/dialog/user-domain")).toHaveValue("domain");
  await expect(page.getByTestId("user-configuration/dialog/email")).toHaveValue("email");
  await expect(page.getByTestId("user-configuration/dialog/jira-token")).toHaveValue("token");
});
