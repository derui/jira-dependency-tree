import { test, expect } from "vitest";
import { loading } from "../actions";
import { getInitialState, reducer } from "./loading";

test("initial state", () => {
  expect(getInitialState()).toEqual({ import: { loading: false }, issues: {} });
});

test("loading state for issues", () => {
  let state = getInitialState();
  state = reducer(state, loading.startImport(["key1", "key2"]));

  expect(state.issues).toEqual({ key1: true, key2: true });

  state = reducer(state, loading.finishImport(["key1", "key2", "key3"]));

  expect(state.issues).toEqual({});
});
