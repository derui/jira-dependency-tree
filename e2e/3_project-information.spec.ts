import { test, expect } from "@playwright/test";

test("open editor and input project key", async ({ page }) => {
  await page.goto("/");

  // open editor
  await page.getByTestId("project-information/name").click();
  await expect(page.getByTestId("project-information/editor")).toHaveClass(/--show/);

  const nameInput = page.getByTestId("project-information/name-input");
  // assert input
  await expect(nameInput).toHaveAttribute("placeholder", "required");
  await nameInput.type("KEY");
  await page.getByTestId("project-information/submit").click();

  // Apply and check after.
  await expect(page.getByTestId("project-information/editor")).not.toHaveClass(/--show/);
  await expect(page.getByTestId("project-information/name")).toContainText("Click here");
  await expect(page.getByTestId("project-information/marker")).toHaveClass(/--show/);
});
