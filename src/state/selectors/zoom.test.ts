import { test, expect } from "vitest";
import { changeZoom } from "../actions";
import { createPureStore } from "../store";
import * as s from "./zoom";

test("get percentage", () => {
  const store = createPureStore();

  const ret = s.getZoom()(store.getState());

  expect(ret).toBe(100);
});

test("get changed percentage", () => {
  const selector = s.getZoom();

  const store = createPureStore();

  const ret1 = selector(store.getState());
  store.dispatch(changeZoom(150));

  const ret2 = selector(store.getState());

  expect(ret1).toBe(100);
  expect(ret2).toBe(150);
});
