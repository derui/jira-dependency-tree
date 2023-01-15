import test from "ava";
import { changeZoom } from "../actions";
import { createPureStore } from "../store";
import * as s from "./zoom";

test("get percentage", (t) => {
  const store = createPureStore();

  const ret = s.getZoom()(store.getState());

  t.is(ret, 100);
});

test("get changed percentage", (t) => {
  const selector = s.getZoom();

  const store = createPureStore();

  const ret1 = selector(store.getState());
  store.dispatch(changeZoom(150));

  const ret2 = selector(store.getState());

  t.is(ret1, 100);
  t.is(ret2, 150);
});
