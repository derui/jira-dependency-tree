import { suite } from "uvu";
import * as assert from "uvu/assert";

import { difference, filterEmptyString, filterUndefined, Rect } from "@/util/basic";

const test = suite("util");

test("filter empty string", () => {
  // Arrange

  // Act
  const retA = filterEmptyString("");
  const retB = filterEmptyString("   ");
  const retC = filterEmptyString("a c");

  // Assert
  assert.equal(retA, false, "empty string");
  assert.equal(retB, false, "blank string");
  assert.equal(retC, true, "string is not blank neither empty");
});

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

test("normal rect", () => {
  // arrange

  // do
  const rect = new Rect({ top: 0, left: 0, right: 15, bottom: 10 });

  // verify
  assert.equal(rect.width, 15);
  assert.equal(rect.height, 10);
});

test("invalid rect", () => {
  // arrange

  // do
  const rect = new Rect({ top: 100, left: 20, right: 15, bottom: 10 });

  // verify
  assert.equal(rect.width, 0);
  assert.equal(rect.height, 0);
});

test.run();
