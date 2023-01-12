import test from "ava";
import { getInitialState } from "../slices/api-credential";
import { RootState } from "../store";
import * as s from "./api-credential";

test("get undefined if credential is not setupped", (t) => {
  const state = {
    apiCredential: getInitialState(),
  } as RootState;

  t.is(s.getApiCrednetial()(state), undefined);
});

test("get api credential", (t) => {
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

  t.is(s.getApiCrednetial()(state), credential);
});
