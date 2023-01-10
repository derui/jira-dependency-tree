// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from "react";
import test from "ava";
import { render, screen, cleanup } from "@testing-library/react";

import { Icon } from "./icon";

test.afterEach(cleanup);

test.serial("should be able to render", (t) => {
  render(<Icon type="chevron-down" />);

  const element = screen.getByTestId("icon");

  t.true(element.className.includes("chevron-down.svg"));
  t.true(element.className.includes("w-5") && element.className.includes("h-5"));
  t.true(element.className.includes("primary-"));
});

test.serial("size and color", (t) => {
  render(<Icon type="chevron-down" size="m" color="secondary1" />);

  const element = screen.getByTestId("icon");

  t.true(element.className.includes("chevron-down.svg"));
  t.true(element.className.includes("w-6") && element.className.includes("h-6"));
  t.true(element.className.includes("secondary1-"));
});

test.serial("active state", (t) => {
  render(<Icon type="chevron-down" active />);

  const element = screen.getByTestId("icon");

  t.false(element.className.includes("primary-500"));
});

test.serial("disabled", (t) => {
  render(<Icon type="chevron-down" disabled />);

  const element = screen.getByTestId("icon");

  t.true(element.className.includes("before:bg-lightgray"));
});
