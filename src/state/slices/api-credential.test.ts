import test from "ava";
import { restoreApiCredential, submitApiCredentialFulfilled } from "../actions";
import { getInitialState, reducer } from "./api-credential";

test("initial state", (t) => {
  t.deepEqual(getInitialState(), {});
});

test("apply fulfilled api credential", (t) => {
  const payload = {
    email: "email",
    apiBaseUrl: "http://example.com",
    apiKey: "key",
    token: "token",
    userDomain: "domain",
  };

  const ret = reducer(getInitialState(), submitApiCredentialFulfilled(payload));

  t.deepEqual(ret, { credential: payload });
});

test("apply restored api credential", (t) => {
  const payload = {
    email: "email",
    apiBaseUrl: "http://example.com",
    apiKey: "key",
    token: "token",
    userDomain: "domain",
  };

  const ret = reducer(getInitialState(), restoreApiCredential(payload));

  t.deepEqual(ret, { credential: payload });
});
