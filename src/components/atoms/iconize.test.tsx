import { test, expect } from "vitest";
import { iconize } from "./iconize";

test("get class name containing icon type", () => {
  const ret = iconize({ type: "chevron-down" });

  expect(ret.includes("chevron-down.svg")).toBeTruthy();
  expect(ret.includes("w-5") && ret.includes("h-5")).toBeTruthy();
  expect(ret.includes("primary-")).toBeTruthy();
});

test("size and color", () => {
  const ret = iconize({ type: "chevron-down", size: "m", color: "secondary1" });

  expect(ret.includes("chevron-down.svg")).toBe(true);
  expect(ret.includes("w-6") && ret.includes("h-6")).toBe(true);
  expect(ret.includes("secondary1-")).toBe(true);
});

test("active state", () => {
  const ret = iconize({ type: "chevron-down", active: true });

  expect(ret.includes("primary-500")).toBe(false);
});

test("disabled", () => {
  const ret = iconize({ type: "chevron-down", disabled: true });

  expect(ret.includes("before:bg-lightgray")).toBe(true);
});

test("group", () => {
  const ret = iconize({ type: "chevron-down", group: "group" });

  expect(ret.includes("group-hover:before:bg-primary-300")).toBe(true);
});
