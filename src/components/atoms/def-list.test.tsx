import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DefList } from "./def-list";

afterEach(cleanup);

test("should be able to render", () => {
  render(<DefList />);
});
