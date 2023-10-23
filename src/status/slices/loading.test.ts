import { test, expect } from "vitest";
import { getInitialState } from "./loading";

test("initial state", () => {
  expect(getInitialState()).toEqual({ import: { loading: false } });
});
