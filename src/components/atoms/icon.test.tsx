import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import { Icon } from "./icon";

afterEach(cleanup);

test("should be able to render", () => {
  render(<Icon type="chevron-down" />);

  const element = screen.getByTestId("icon");

  expect(element.className.includes("chevron-down.svg")).toBeTruthy();
  expect(element.className.includes("w-5") && element.className.includes("h-5")).toBeTruthy();
  expect(element.className.includes("primary-")).toBeTruthy();
});

test("size and color", () => {
  render(<Icon type="chevron-down" size="m" color="secondary1" />);

  const element = screen.getByTestId("icon");

  expect(element.className.includes("chevron-down.svg")).toBe(true);
  expect(element.className.includes("w-6") && element.className.includes("h-6")).toBe(true);
  expect(element.className.includes("secondary1-")).toBe(true);
});

test("active state", () => {
  render(<Icon type="chevron-down" active />);

  const element = screen.getByTestId("icon");

  expect(element.className.includes("primary-500")).toBe(false);
});

test("disabled", () => {
  render(<Icon type="chevron-down" disabled />);

  const element = screen.getByTestId("icon");

  expect(element.className.includes("before:bg-lightgray")).toBe(true);
});
