import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import { ZoomSlider } from "./zoom-slider";

afterEach(cleanup);

test("should be able to render", (t) => {
  render(<ZoomSlider zoom={100} />);

  const element = screen.getByTestId("current-zoom");

  expect(element.textContent).toBe("100%");
});

test("do not print decimal point", (t) => {
  render(<ZoomSlider zoom={100.8} />);

  const element = screen.getByTestId("current-zoom");

  expect(element.textContent).toBe("101%");
});
