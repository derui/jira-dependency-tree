import test from "ava";
import { changeZoom } from "../actions";
import { getInitialState, reducer } from "./zoom";

test("initial state", (t) => {
  t.deepEqual(getInitialState(), { zoomPercentage: 100 });
});

test("update zoom", (t) => {
  const state = reducer(getInitialState(), changeZoom(120));

  t.is(state.zoomPercentage, 120);
});
