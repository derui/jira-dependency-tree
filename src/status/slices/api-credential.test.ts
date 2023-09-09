import { test, expect } from "vitest";
import { restoreApiCredential, submitApiCredentialFulfilled } from "../actions";
import { getInitialState, reducer } from "./api-credential";

test("initial state", () => {
  expect(getInitialState()).toEqual({});
});

test("apply fulfilled api credential", () => {
  const payload = {
    email: "email",
    apiBaseUrl: "http://example.com",
    apiKey: "key",
    token: "token",
    userDomain: "domain",
  };

  const ret = reducer(getInitialState(), submitApiCredentialFulfilled(payload));

  expect(ret).toEqual({ credential: payload });
});

test("apply restored api credential", () => {
  const payload = {
    email: "email",
    apiBaseUrl: "http://example.com",
    apiKey: "key",
    token: "token",
    userDomain: "domain",
  };

  const ret = reducer(getInitialState(), restoreApiCredential(payload));

  expect(ret).toEqual({ credential: payload });
});
