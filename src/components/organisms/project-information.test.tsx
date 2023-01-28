import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Provider } from "react-redux";
import { ProjectInformation } from "./project-information";
import { createPureStore } from "@/state/store";
import { submitProjectKeyFulfilled } from "@/state/actions";
import { projectFactory } from "@/model/project";

afterEach(cleanup);

test("should be able to render", () => {
  const store = createPureStore();

  render(
    <Provider store={store}>
      <ProjectInformation />
    </Provider>,
  );

  const span = screen.queryByText("Click here");
  const marker = screen.getByTestId("marker");

  expect(span).not.toBeNull();
  expect(marker.getAttribute("aria-hidden")).toEqual("false");
});

test("show editor if name clicked", async () => {
  const store = createPureStore();

  render(
    <Provider store={store}>
      <ProjectInformation />
    </Provider>,
  );

  await userEvent.click(screen.getByText("Click here"));

  const name = screen.getByTestId("name");
  const editor = screen.getByTestId("nameEditor");

  expect(name.classList.contains("hidden")).toBeTruthy();
  expect(editor.classList.contains("hidden")).toBeFalsy();
});

test("reset when click cancel button", async () => {
  const store = createPureStore();

  render(
    <Provider store={store}>
      <ProjectInformation />
    </Provider>,
  );

  await userEvent.click(screen.getByText("Click here"));
  await userEvent.type(screen.getByTestId("key"), "key");
  await userEvent.click(screen.getByTestId("cancel"));

  const span = screen.queryByText("Click here");
  const editor = screen.getByTestId("nameEditor");

  expect(span).not.toBeNull();
  expect(editor.classList.contains("hidden")).toBeTruthy();
});

test("send key and loading state", async () => {
  const store = createPureStore();

  render(
    <Provider store={store}>
      <ProjectInformation />
    </Provider>,
  );

  await userEvent.click(screen.getByText("Click here"));
  await userEvent.type(screen.getByTestId("key"), "key");
  await userEvent.click(screen.getByTestId("submit"));

  const skeleton = screen.queryByTestId("skeleton");
  const editor = screen.getByTestId("nameEditor");

  expect(skeleton?.classList?.contains("hidden"), "skeleton").toBeFalsy();
  expect(editor.classList.contains("hidden")).toBeTruthy();
});

test("show project name ", async () => {
  const store = createPureStore();

  render(
    <Provider store={store}>
      <ProjectInformation />
    </Provider>,
  );

  await userEvent.click(screen.getByText("Click here"));
  await userEvent.type(screen.getByTestId("key"), "key");
  await userEvent.click(screen.getByTestId("submit"));

  store.dispatch(submitProjectKeyFulfilled(projectFactory({ key: "key", id: "id", name: "project name" })));

  const name = await screen.findByText("project name");

  expect(name.textContent).toEqual("project name");
});
