import { test, expect } from "vitest";
import { colorToInvertColor } from "./color";

test.each([
  ["#000000", "#ffffff"],
  ["#ff0000", "#00ffff"],
  ["#00ff00", "#ff00ff"],
  ["#0000ff", "#ffff00"],
  ["#800000", "#7fffff"],
])("get invert color", (actual, expected) => {
  expect(colorToInvertColor(actual)).toBe(expected);
});
