import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Provider } from "react-redux";
import { TopToolbar } from "./top-toolbar";
import { createStore } from "@/state/store";

afterEach(cleanup);

test("should be able to render", async () => {
  const store = createStore();

  render(
    <Provider store={store}>
      <TopToolbar />
    </Provider>,
  );

  const panel = screen.getByTestId("importer/root");
  const button = screen.getByTestId("opener");

  expect(panel.getAttribute("aria-hidden")).toBe("true");
  expect(button.getAttribute("disabled")).toBeNull();
});

test("open panel after clicked", async () => {
  const store = createStore();

  render(
    <Provider store={store}>
      <TopToolbar />
    </Provider>,
  );

  await userEvent.click(screen.getByTestId("opener"));

  const panel = screen.getByTestId("importer/root");
  const button = screen.getByTestId("opener") as HTMLButtonElement;

  expect(button.disabled).toBe(true);
  expect(panel.getAttribute("aria-hidden")).toBe("false");
});

test("close panel", async () => {
  const store = createStore();

  render(
    <Provider store={store}>
      <TopToolbar />
    </Provider>,
  );

  await userEvent.click(screen.getByTestId("opener"));
  await userEvent.click(screen.getByTestId("importer/close"));

  const panel = screen.getByTestId("importer/root");
  const button = screen.getByTestId("opener") as HTMLButtonElement;

  expect(button.disabled).toBe(false);
  expect(panel.getAttribute("aria-hidden")).toBe("true");
});
