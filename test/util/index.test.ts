import { suite } from "uvu";
import * as assert from "uvu/assert";

import { difference, filterUndefined } from "@/util";

const test = suite("util");

test("difference between two sets", () => {
  // Arrange
  const a = new Set([1, 2, 3, 4, 5]);
  const b = new Set([1, 2, 4, 5, 6]);

  // Do
  const retA = difference(a, b);
  const retB = difference(b, a);

  // Verify
  assert.equal(retA, new Set([3]), "ret a - b");
  assert.equal(retB, new Set([6]), "ret b - a");
});

test("filter undefined", () => {
  // arrange

  // do

  // verify
  assert.equal(filterUndefined(undefined), false);
  assert.equal(filterUndefined("value"), true);
  assert.equal(filterUndefined(""), true);
});

test.run();
