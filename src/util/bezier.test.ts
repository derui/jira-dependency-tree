import test from "ava";
import { factorialize } from "@/util/bezier";

test("factorialize", (t) => {
  t.is(factorialize(0), 1);
  t.is(factorialize(1), 1);
  t.is(factorialize(2), 2);
  t.is(factorialize(3), 6);
  t.is(factorialize(4), 24);
  t.is(factorialize(5), 120);
});
