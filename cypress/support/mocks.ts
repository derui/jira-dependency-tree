// response given fixture from specified with this type.

import { RestRequest } from "msw";

export type Predicate = (request: RestRequest) => boolean;

// Response status is always 200, and content-type is always application/json.
export type APIMockDefinition = {
  // path of fixture.
  fixtures: string[];
  // response status. Default is 200.
  status?: number;
  // content-type of response. Default is 'application/json'
  contentType?: string;
  // HTTP method for mocking API. Default is `GET`
  method?: "GET" | "POST";
  predicates: Record<string, Predicate>;
};
export type APIMock = APIMockDefinition;

// definitions for API mocking. Mocking is always reset when cy.mockAPI() is called.
export interface APIMocks {
  [k: string]: APIMock;
}

export const get = function get(fixtures: string[], predicates?: { [k: string]: Predicate }): APIMockDefinition {
  if (fixtures.length === 0) {
    throw Error("Specify least one fixture");
  }

  return {
    fixtures,
    method: "GET",
    predicates: !predicates ? { [fixtures[0]]: () => true } : predicates,
  };
};

export const post = function post(fixtures: string[], predicates?: { [k: string]: Predicate }): APIMockDefinition {
  if (fixtures.length === 0) {
    throw Error("Specify least one fixture");
  }

  return {
    fixtures,
    method: "POST",
    predicates: !predicates ? { [fixtures[0]]: () => true } : predicates,
  };
};
