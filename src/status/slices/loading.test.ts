import { test, expect } from "vitest";
import { getInitialState } from "./loading";

test("initial state", (t) => {
  t.is(getInitialState(), {});
});
