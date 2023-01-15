/// <reference types="cypress" />

import { rest } from "msw";
import { APIMockDefinition, APIMocks } from "./mocks";

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --

// shortcut function for testid
const getByTestId = function getByTestId(testid: string) {
  return cy.get(`[data-testid="${testid}"]`);
};

Cypress.Commands.add("testid", getByTestId);

const mockAPI = function mockAPI(apiMocks: APIMocks) {
  cy.window()
    .its("msw")
    .then((msw) => {
      Object.keys(apiMocks).map((key) => {
        const definition = apiMocks[key];
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

        const fixtures = new Map<string, unknown>();
        definition.fixtures.forEach((fixture) => {
          cy.fixture(fixture).then((body) => {
            fixtures.set(fixture, body);
          });
        });
        cy.wrap(fixtures).then((fixtures) => {
          const handler = rest(key, async (req, res, ctx) => {
            const predicates = await Promise.all(
              Array.from(fixtures.keys()).map(async (fixture) => {
                const predicate = definition.predicates[fixture];
                if (!predicate) {
                  return [fixture, false] as const;
                }

                return await predicate(req).then((ret) => [fixture, ret] as const);
              }),
            );
            const fixture = predicates.find(([, ret]) => ret);

            return res(
              ctx.status(definition.status || 200),
              ctx.set("content-type", definition.contentType || "application/json"),
              ctx.body(JSON.stringify(fixtures.get(fixture[0]))),
            );
          });

          msw.worker.use(handler);
        });
      });
    });
};

Cypress.Commands.add("mockAPI", mockAPI);

//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      testid: typeof getByTestId;
      mockAPI: typeof mockAPI;
    }
  }

  interface Window {
    msw: {
      worker: any;
      rest: typeof rest;
    };
  }
}
