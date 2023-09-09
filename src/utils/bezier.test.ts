import { test, expect } from "vitest";
import { factorialize } from "@/utils/bezier";

test("factorialize", () => {
  expect(factorialize(0)).toBe(1);
  expect(factorialize(1)).toBe(1);
  expect(factorialize(2)).toBe(2);
  expect(factorialize(3)).toBe(6);
  expect(factorialize(4)).toBe(24);
  expect(factorialize(5)).toBe(120);
});
