import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import { Translate } from "./svg-translate";

afterEach(cleanup);

test("should be able to render", () => {
  render(
    <svg>
      <Translate>
        <text>foo</text>
      </Translate>
    </svg>,
  );

  const element = screen.getByText("foo");

  expect(element.textContent).toBe("foo");
  expect(screen.queryByTestId("translate")).toBe(null);
});

test("render transformer when pass x and y", () => {
  render(
    <svg>
      <Translate x={10} y={20}>
        <text>foo</text>
      </Translate>
    </svg>,
  );

  const element = screen.getByText("foo");

  expect(element.textContent).toBe("foo");
  expect(screen.queryByTestId("translate")).not.toBe(null);
});
