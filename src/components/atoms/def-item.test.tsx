import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import { DefItem } from "./def-item";

afterEach(cleanup);

test("should be able to render", () => {
  render(<DefItem label="label">item</DefItem>);

  expect(screen.getByTestId("root").textContent).toContain("label");
  expect(screen.getByTestId("root").textContent).toContain("item");
});
