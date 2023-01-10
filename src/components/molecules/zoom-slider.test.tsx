// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from "react";
import test from "ava";
import { render, screen, cleanup } from "@testing-library/react";

import { ZoomSlider } from "./zoom-slider";

test.afterEach(cleanup);

test.serial("should be able to render", (t) => {
  render(<ZoomSlider zoom={100} />);

  const element = screen.getByTestId("current-zoom");

  t.is(element.textContent, "100%");
});

test.serial("do not print decimal point", (t) => {
  render(<ZoomSlider zoom={100.8} />);

  const element = screen.getByTestId("current-zoom");

  t.is(element.textContent, "101%");
});
