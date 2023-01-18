import { test, expect } from "vitest";
import { changeZoom } from "../actions";
import { getInitialState, reducer } from "./zoom";

test("initial state", () => {
  expect(getInitialState()).toEqual({ zoomPercentage: 100 });
});

test("update zoom", () => {
  const state = reducer(getInitialState(), changeZoom(120));

  expect(state.zoomPercentage).toBe(120);
});
