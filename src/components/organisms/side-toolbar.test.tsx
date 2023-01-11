// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from "react";
import test from "ava";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { SideToolbar } from "./side-toolbar";
import { createDependencyRegistrar } from "@/util/dependency-registrar";
import { env } from "@/env";
import { createStore } from "@/state/store";

test.afterEach(cleanup);

const registrar = createDependencyRegistrar<Dependencies>();

test.before(() => {
  registrar.register("env", env);
});

test.serial("should be able to render", (t) => {
  const store = createStore(registrar);

  render(
    <Provider store={store}>
      <SideToolbar />
    </Provider>,
  );

  const icon = screen.getByTestId("layout/icon") as HTMLSpanElement;

  t.is(icon.dataset.active, "false");
});

test.serial("active when layouter clicked", async (t) => {
  const store = createStore(registrar);

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
  const store = createStore(registrar);

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
  const store = createStore(registrar);

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
