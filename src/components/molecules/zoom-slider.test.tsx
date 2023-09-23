import { test, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import { ZoomSlider } from "./zoom-slider";
import { useZoom } from "@/hooks/zoom";

vi.mock("@/hooks/zoom", () => {
  return {
    useZoom: vi.fn(),
  };
});

afterEach(cleanup);

test("should be able to render", () => {
  const mock = vi.mocked(useZoom);
  mock.mockReturnValue(100);

  render(<ZoomSlider />);

  const element = screen.getByTestId("current-zoom");

  expect(element.textContent).toBe("100%");
});

test("do not print decimal point", () => {
  const mock = vi.mocked(useZoom);
  mock.mockReturnValue(100.8);
  render(<ZoomSlider />);

  const element = screen.getByTestId("current-zoom");

  expect(element.textContent).toBe("101%");
});
