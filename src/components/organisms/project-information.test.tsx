// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from "react";
import test from "ava";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Provider } from "react-redux";
import { ProjectInformation } from "./project-information";
import { createPureStore } from "@/state/store";
import { submitProjectKeyFulfilled } from "@/state/actions";
import { projectFactory } from "@/model/project";

test.afterEach(cleanup);

test.serial("should be able to render", (t) => {
  const store = createPureStore();

  render(
    <Provider store={store}>
      <ProjectInformation />
    </Provider>,
  );

  const span = screen.getByText("Click here");

  t.truthy(span, "name");
});

test.serial("show editor if name clicked", async (t) => {
  const store = createPureStore();

  render(
    <Provider store={store}>
      <ProjectInformation />
    </Provider>,
  );

  await userEvent.click(screen.getByText("Click here"));

  const name = screen.getByTestId("name");
  const editor = screen.getByTestId("nameEditor");

  t.true(name.classList.contains("hidden"));
  t.false(editor.classList.contains("hidden"));
});

test.serial("reset when click cancel button", async (t) => {
  const store = createPureStore();

  render(
    <Provider store={store}>
      <ProjectInformation />
    </Provider>,
  );

  await userEvent.click(screen.getByText("Click here"));
  await userEvent.type(screen.getByTestId("key/input"), "key");
  await userEvent.click(screen.getByTestId("cancel"));

  const span = screen.getByText("Click here");
  const editor = screen.getByTestId("nameEditor");

  t.truthy(span, "name");
  t.true(editor.classList.contains("hidden"));
});

test.serial("send key and loading state", async (t) => {
  const store = createPureStore();

  render(
    <Provider store={store}>
      <ProjectInformation />
    </Provider>,
  );

  await userEvent.click(screen.getByText("Click here"));
  await userEvent.type(screen.getByTestId("key/input"), "key");
  await userEvent.click(screen.getByTestId("submit"));

  const skeleton = screen.queryByTestId("skeleton");
  const editor = screen.getByTestId("nameEditor");

  t.false(skeleton?.classList?.contains("hidden"), "skeleton");
  t.true(editor.classList.contains("hidden"));
});

test.serial("show project name ", async (t) => {
  const store = createPureStore();

  render(
    <Provider store={store}>
      <ProjectInformation />
    </Provider>,
  );

  await userEvent.click(screen.getByText("Click here"));
  await userEvent.type(screen.getByTestId("key/input"), "key");
  await userEvent.click(screen.getByTestId("submit"));

  store.dispatch(submitProjectKeyFulfilled(projectFactory({ key: "key", id: "id", name: "project name" })));

  const name = await screen.findByText("project name");

  t.is(name.textContent, "project name");
});
