import { test as base, Page } from "@playwright/test";
import { APIMockDefinition, APIMocks } from "support/mocks";
import * as fs from "node:fs";

// Declare the types of your fixtures.
type MyFixtures = {
  withApiMock: (url: string, mocks: APIMocks) => Promise<void>;
};

const mockAPI = function mockAPI(page: Page): (url: string, apiMocks: APIMocks) => Promise<void> {
  return async (url, apiMocks) => {
    await page.goto(url);
    await page.waitForFunction(() => !!window.msw);

    const fixtures = Object.keys(apiMocks).map((key) => {
      const apiMock = apiMocks[key];
      let definition: APIMockDefinition;

      if (typeof apiMock === "string") {
        definition = { fixture: apiMock };
      } else {
        definition = apiMock;
      }

      const fixture = fs.readFileSync(`e2e/fixtures/${definition.fixture}`).toString();
      return { key, definition, fixture };
    });

    await page.evaluate(
      ([fixtures]) => {
        const msw = window.msw;

        fixtures.map(({ key, definition, fixture }) => {
          let rest: typeof msw.rest.all;

          switch (definition.method) {
            case "POST":
              rest = msw.rest.post;
              break;
            case "GET":
            default:
              rest = msw.rest.get;
              break;
          }

          const handler = rest(key, (req, res, ctx) => {
            return res.once(
              ctx.status(definition.status || 200),
              ctx.set("content-type", definition.contentType || "application/json"),
              ctx.body(fixture)
            );
          });

          msw.worker.use(handler);
        });
      },
      [fixtures]
    );
  };
};

// Extend base test by providing "todoPage" and "settingsPage".
// This new "test" can be used in multiple test files, and each of them will get the fixtures.
export const test = base.extend<MyFixtures>({
  withApiMock: async ({ page }, use) => {
    await use(mockAPI(page));
  },
});

export { expect } from "@playwright/test";
