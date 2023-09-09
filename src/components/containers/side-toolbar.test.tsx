import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { SideToolbar } from "./side-toolbar";
import { createStore } from "@/status/store";

afterEach(cleanup);

test("should be able to render", () => {
  const store = createStore();

  render(
    <Provider store={store}>
      <SideToolbar />
    </Provider>,
  );

  const layouter = screen.queryByTestId("graph-layouter/root");

  expect(layouter).toBeNull();
});
