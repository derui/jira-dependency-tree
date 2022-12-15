import test from "ava";

import { difference, filterEmptyString, filterUndefined, Rect } from "@/util/basic";

test("filter empty string", (t) => {
  // Arrange

  // Act
  const retA = filterEmptyString("");
  const retB = filterEmptyString("   ");
  const retC = filterEmptyString("a c");

  // Assert
  t.deepEqual(retA, false, "empty string");
  t.deepEqual(retB, false, "blank string");
  t.deepEqual(retC, true, "string is not blank neither empty");
});

test("difference between two sets", (t) => {
  // Arrange
  const a = new Set([1, 2, 3, 4, 5]);
  const b = new Set([1, 2, 4, 5, 6]);

  // Do
  const retA = difference(a, b);
  const retB = difference(b, a);

  // Verify
  t.deepEqual(retA, new Set([3]), "ret a - b");
  t.deepEqual(retB, new Set([6]), "ret b - a");
});

test("filter undefined", (t) => {
  // arrange

  // do

  // verify
  t.deepEqual(filterUndefined(undefined), false);
  t.deepEqual(filterUndefined("value"), true);
  t.deepEqual(filterUndefined(""), true);
});

test("normal rect", (t) => {
  // arrange

  // do
  const rect = new Rect({ top: 0, left: 0, right: 15, bottom: 10 });

  // verify
  t.deepEqual(rect.width, 15);
  t.deepEqual(rect.height, 10);
});

test("invalid rect", (t) => {
  // arrange

  // do
  const rect = new Rect({ top: 100, left: 20, right: 15, bottom: 10 });

  // verify
  t.deepEqual(rect.width, 0);
  t.deepEqual(rect.height, 0);
});
