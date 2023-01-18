import { test, expect } from "vitest";
import { getInitialState } from "../slices/api-credential";
import { RootState } from "../store";
import * as s from "./api-credential";

test("get undefined if credential is not setupped", () => {
  const state = {
    apiCredential: getInitialState(),
  } as RootState;

  expect(s.getApiCrednetial()(state)).toBeUndefined();
});

test("get api credential", () => {
  const credential = {
    apiBaseUrl: "aa",
    apiKey: "key",
    email: "email",
    token: "token",
    userDomain: "domain",
  };
  const state = {
    apiCredential: {
      credential,
    },
  } as RootState;

  expect(s.getApiCrednetial()(state)).toEqual(credential);
});
