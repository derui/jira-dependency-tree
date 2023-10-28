import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import { DefList } from "./def-list";

afterEach(cleanup);

test("should be able to render", () => {
  render(<DefList />);
});

test("render items", () => {
  render(
    <DefList>
      <li>item1</li>
    </DefList>,
  );

  expect(screen.queryByText("item1")).not.toBeNull();
});
