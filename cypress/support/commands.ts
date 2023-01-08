/// <reference types="cypress" />

import run, { Drivers, Sources } from "@cycle/run";
import { DOMSource, makeDOMDriver } from "@cycle/dom";
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
const mount = function mount<D extends Drivers>(
  component: (source: Sources<D> & { DOM: DOMSource; state?: any }) => any,
  drivers: D,
): void {
  const dispose = run(component, {
    ...drivers,
    DOM: makeDOMDriver("#root"),
  });

  // unmount component automatically
  Cypress.once("test:after:run", dispose);
};

Cypress.Commands.add("mount", mount);

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
        cy.wrap(
          Promise.all(
            definition.fixtures.map((fixture) => {
              return cy.fixture(fixture).then((body) => {
                fixtures.set(fixture, body);
              });
            }),
          ),
        ).then(() => {
          console.log(fixtures);
          const handler = rest(key, (req, res, ctx) => {
            const fixture = Array.from(fixtures.keys()).find((fixture) => {
              const predicate = definition.predicates[fixture];
              if (!predicate) {
                return false;
              }

              return predicate(req);
            });
            console.log(fixture);

            return res(
              ctx.status(definition.status || 200),
              ctx.set("content-type", definition.contentType || "application/json"),
              ctx.body(JSON.stringify(fixtures.get(fixture))),
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
      mount: typeof mount;
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
