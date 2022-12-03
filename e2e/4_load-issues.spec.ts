import { test, expect } from "./support/extended-test.js";
import { post } from "./support/mocks.js";

test.beforeEach(async ({ withApiMock }) => {
  await withApiMock("/", {
    "http://localhost:3000/load-issues": post("basic/issues.json"),
    "http://localhost:3000/load-project": post("basic/project.json"),
    "http://localhost:3000/get-suggestions": post("basic/suggestions.json"),
  });
});

test("print issues", async ({ page }) => {
  // open editor
  await page.getByTestId("project-information/name").click();
  await page.getByTestId("project-information/name-input").type("KEY");
  await page.getByTestId("project-information/submit").click();
  await page.getByTestId("user-configuration/opener").click();

  await page.getByTestId("user-configuration/dialog/user-domain").type("domain");
  await page.getByTestId("user-configuration/dialog/email").type("email");
  await page.getByTestId("user-configuration/dialog/jira-token").type("token");
  await page.getByTestId("user-configuration/dialog/submit").click();

  // load project.
  await expect(page.getByTestId("project-information/name")).toContainText("Testing Project");
  await expect(page.getByTestId("project-information/marker")).not.toHaveClass(/--show/);
  await expect(page.getByTestId("sync-jira/button")).not.toHaveAttribute("disabled", "");
});
