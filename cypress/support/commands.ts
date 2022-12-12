/// <reference types="cypress" />

import run, { Drivers, Sources } from "@cycle/run";
import { DOMSource, makeDOMDriver } from "@cycle/dom";
import { APIMockDefinition, APIMocks } from "./mocks";
import { rest } from "msw";

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
  drivers: D
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
        const apiMock = apiMocks[key];
        let definition: APIMockDefinition;

        if (typeof apiMock === "string") {
          definition = { fixture: apiMock };
        } else {
          definition = apiMock;
        }

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

        cy.fixture(definition.fixture).then((fixture) => {
          const handler = rest(key, (req, res, ctx) => {
            return res(
              ctx.status(definition.status || 200),
              ctx.set("content-type", definition.contentType || "application/json"),
              ctx.body(JSON.stringify(fixture))
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
