import { test, expect } from "@playwright/test";

test("restore from local storage", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "jiraDependencyTree",
      JSON.stringify({
        settings: {
          issueNodeSize: { height: 10, width: 100 },
          userDomain: "domain",
          credentials: {
            email: "email",
            jiraToken: "token",
          },
        },
      }),
    );
  });

  await page.goto("/");

  // check restored value
  await expect(page.getByTestId("user-configuration/marker")).not.toHaveClass("--show");
  await page.getByTestId("user-configuration/opener").click();
  await expect(page.getByTestId("user-configuration/form/user-domain")).toHaveValue("domain");
  await expect(page.getByTestId("user-configuration/form/email")).toHaveValue("email");
  await expect(page.getByTestId("user-configuration/form/token")).toHaveValue("token");

  // re-open and keep previous value
  await page.getByTestId("user-configuration/form/submit").click();
  await page.getByTestId("user-configuration/opener").click();

  await expect(page.getByTestId("user-configuration/form/user-domain")).toHaveValue("domain");
  await expect(page.getByTestId("user-configuration/form/email")).toHaveValue("email");
  await expect(page.getByTestId("user-configuration/form/token")).toHaveValue("token");
});

test("store local storage submitted settings", async ({ page }) => {
  page.goto("/");

  // type value and submit
  await page.getByTestId("user-configuration/opener").click();
  await page.getByTestId("user-configuration/form/user-domain").type("domain");
  await page.getByTestId("user-configuration/form/email").type("email");
  await page.getByTestId("user-configuration/form/token").type("token");
  await page.getByTestId("user-configuration/form/submit").click();

  // check in local storage
  const actual = await page
    .evaluate(() => window.localStorage.getItem("jiraDependencyTree"))
    .then((v) => JSON.parse(v || ""));

  expect(actual).toEqual({
    settings: {
      userDomain: "domain",
      credentials: {
        email: "email",
        jiraToken: "token",
      },
    },
  });
});
