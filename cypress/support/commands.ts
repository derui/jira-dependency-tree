/// <reference types="cypress" />

import run, { Drivers, Sources } from "@cycle/run";
import { DOMSource, makeDOMDriver } from "@cycle/dom";

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
    }
  }
}
