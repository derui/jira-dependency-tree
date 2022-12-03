import { setupWorker, rest } from "msw";

// response given fixture from specified with this type.
// Response status is always 200, and content-type is always application/json.
export type SimpleAPIMockDefinition = string;
export type APIMockDefinition = {
  // path of fixture.
  fixture: string;
  // response status. Default is 200.
  status?: number;
  // content-type of response. Default is 'application/json'
  contentType?: string;
  // HTTP method for mocking API. Default is `GET`
  method?: "GET" | "POST";
};
export type APIMock = SimpleAPIMockDefinition | APIMockDefinition;

// definitions for API mocking. Mocking is always reset when cy.mockAPI() is called.
export interface APIMocks {
  [k: string]: APIMock;
}

// create empty worker
const worker = setupWorker();

window.msw = {
  worker,
  rest,
};

declare global {
  interface Window {
    msw: {
      worker: typeof worker;
      rest: typeof rest;
    };
  }
}
