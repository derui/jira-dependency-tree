import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { SideToolbar } from "./side-toolbar";
import { createPureStore } from "@/state/store";

afterEach(cleanup);

test("should be able to render", () => {
  const store = createPureStore();

  render(
    <Provider store={store}>
      <SideToolbar />
    </Provider>,
  );

  const layouter = screen.queryByTestId("graph-layouter/root");

  expect(layouter).toBeNull();
});
