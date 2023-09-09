import { test, expect } from "vitest";

import { difference, filterEmptyString, filterUndefined, Rect } from "@/utils/basic";

test("filter empty string", () => {
  // Arrange

  // Act
  const retA = filterEmptyString("");
  const retB = filterEmptyString("   ");
  const retC = filterEmptyString("a c");
  const retD = filterEmptyString(undefined);

  // Assert
  expect(retA).toBe(false);
  expect(retB).toBe(false);
  expect(retC).toBe(true);
  expect(retD).toBe(false);
});

test("difference between two sets", () => {
  // Arrange
  const a = new Set([1, 2, 3, 4, 5]);
  const b = new Set([1, 2, 4, 5, 6]);

  // Do
  const retA = difference(a, b);
  const retB = difference(b, a);

  // Verify
  expect(retA).toEqual(new Set([3]));
  expect(retB).toEqual(new Set([6]));
});

test("filter undefined", () => {
  // arrange

  // do

  // verify
  expect(filterUndefined(undefined)).toBe(false);
  expect(filterUndefined("value")).toBe(true);
  expect(filterUndefined("")).toBe(true);
});

test("normal rect", () => {
  // arrange

  // do
  const rect = new Rect({ top: 0, left: 0, right: 15, bottom: 10 });

  // verify
  expect(rect.width).toBe(15);
  expect(rect.height).toBe(10);
});

test("invalid rect", () => {
  // arrange

  // do
  const rect = new Rect({ top: 100, left: 20, right: 15, bottom: 10 });

  // verify
  expect(rect.width).toBe(0);
  expect(rect.height).toBe(0);
});

test("empty rect", () => {
  const rect = Rect.empty();

  expect(rect.bottom).toBe(0);
  expect(rect.top).toBe(0);
  expect(rect.left).toBe(0);
  expect(rect.right).toBe(0);
  expect(rect.width).toBe(0);
  expect(rect.height).toBe(0);
});
