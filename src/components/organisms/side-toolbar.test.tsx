// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from "react";
import test from "ava";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { SideToolbar } from "./side-toolbar";
import { createPureStore } from "@/state/store";

test.afterEach(cleanup);

test.serial("should be able to render", (t) => {
  const store = createPureStore();

  render(
    <Provider store={store}>
      <SideToolbar />
    </Provider>,
  );

  const icon = screen.getByTestId("layout/icon") as HTMLSpanElement;

  t.is(icon.dataset.active, "false");
});

test.serial("active when layouter clicked", async (t) => {
  const store = createPureStore();

  render(
    <Provider store={store}>
      <SideToolbar />
    </Provider>,
  );

  await userEvent.click(screen.getByTestId("graph-layout"));

  const icon = screen.getByTestId("layout/icon") as HTMLSpanElement;
  const horizontal = screen.getByTestId("horizontal/icon") as HTMLSpanElement;
  const vertical = screen.getByTestId("vertical/icon") as HTMLSpanElement;

  t.is(icon.dataset.active, "true");
  t.is(horizontal.dataset.active, "true");
  t.is(vertical.dataset.active, "false");
  t.is(screen.getByTestId("layouter").classList.contains("visible"), true);
});

test.serial("change layout when clicked", async (t) => {
  const store = createPureStore();

  render(
    <Provider store={store}>
      <SideToolbar />
    </Provider>,
  );

  await userEvent.click(screen.getByTestId("graph-layout"));
  await userEvent.click(screen.getByTestId("vertical-layouter"));

  const icon = screen.getByTestId("layout/icon") as HTMLSpanElement;
  const horizontal = screen.getByTestId("horizontal/icon") as HTMLSpanElement;
  const vertical = screen.getByTestId("vertical/icon") as HTMLSpanElement;

  t.is(icon.dataset.active, "true");
  t.is(horizontal.dataset.active, "false");
  t.is(vertical.dataset.active, "true");
});

test.serial("toggle layouter", async (t) => {
  const store = createPureStore();

  render(
    <Provider store={store}>
      <SideToolbar />
    </Provider>,
  );

  await userEvent.click(screen.getByTestId("graph-layout"));
  await userEvent.click(screen.getByTestId("graph-layout"));

  const icon = screen.getByTestId("layout/icon") as HTMLSpanElement;

  t.is(icon.dataset.active, "false");
  t.is(screen.getByTestId("layouter").classList.contains("visible"), false);
});
