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

  const icon = screen.getByTestId("layout") as HTMLSpanElement;

  expect(icon.dataset.active).toBe("false");
});

test("active when layouter clicked", async () => {
  const store = createPureStore();

  render(
    <Provider store={store}>
      <SideToolbar />
    </Provider>,
  );

  await userEvent.click(screen.getByTestId("graph-layout"));

  const icon = screen.getByTestId("layout") as HTMLSpanElement;
  const horizontal = screen.getByTestId("horizontal") as HTMLSpanElement;
  const vertical = screen.getByTestId("vertical") as HTMLSpanElement;

  expect(icon.dataset.active).toBe("true");
  expect(horizontal.dataset.active).toBe("true");
  expect(vertical.dataset.active).toBe("false");
  expect(screen.getByTestId("layouter").classList.contains("visible")).toBe(true);
});

test("change layout when clicked", async () => {
  const store = createPureStore();

  render(
    <Provider store={store}>
      <SideToolbar />
    </Provider>,
  );

  await userEvent.click(screen.getByTestId("graph-layout"));
  await userEvent.click(screen.getByTestId("vertical-layouter"));

  const icon = screen.getByTestId("layout") as HTMLSpanElement;
  const horizontal = screen.getByTestId("horizontal") as HTMLSpanElement;
  const vertical = screen.getByTestId("vertical") as HTMLSpanElement;

  expect(icon.dataset.active).toBe("true");
  expect(horizontal.dataset.active).toBe("false");
  expect(vertical.dataset.active).toBe("true");
});

test("toggle layouter", async () => {
  const store = createPureStore();

  render(
    <Provider store={store}>
      <SideToolbar />
    </Provider>,
  );

  await userEvent.click(screen.getByTestId("graph-layout"));
  await userEvent.click(screen.getByTestId("graph-layout"));

  const icon = screen.getByTestId("layout") as HTMLSpanElement;

  expect(icon.dataset.active).toBe("false");
  expect(screen.getByTestId("layouter").classList.contains("visible")).toBe(false);
});
