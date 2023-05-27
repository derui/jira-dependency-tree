import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Provider } from "react-redux";
import React from "react";
import { ProjectInformation } from "./project-information";
import { createPureStore } from "@/state/store";
import { projects, submitProjectId, submitProjectIdFulfilled } from "@/state/actions";
import { projectFactory } from "@/model/project";
import { randomProject } from "@/mock-data";

afterEach(cleanup);

const renderWrapper = (node: React.ReactElement) =>
  render(node, {
    wrapper(props) {
      return (
        <>
          {props.children}
          <div id="dialog-root" />
        </>
      );
    },
  });

test("should be able to render", () => {
  const store = createPureStore();

  renderWrapper(
    <Provider store={store}>
      <ProjectInformation />
    </Provider>,
  );

  const span = screen.queryByText("Select project");
  const marker = screen.getByTestId("top/marker");

  expect(span).not.toBeNull();
  expect(marker.getAttribute("aria-hidden")).toEqual("false");
});

test("show editor if name clicked", async () => {
  const store = createPureStore();

  renderWrapper(
    <Provider store={store}>
      <ProjectInformation />
    </Provider>,
  );

  act(() => {
    store.dispatch(projects.loadProjectsSucceeded({ projects: [{ id: "id", key: "key", name: "name" }] }));
  });

  await userEvent.click(screen.getByTestId("top/editButton"));

  const element = screen.queryByTestId("editor/main");

  expect(element).not.toBeNull();
});

test("show project name ", async () => {
  const store = createPureStore();
  store.dispatch(submitProjectIdFulfilled(projectFactory({ key: "key", id: "id", name: "project name" })));

  renderWrapper(
    <Provider store={store}>
      <ProjectInformation />
    </Provider>,
  );

  const name = await screen.findByText("key | project name");

  expect(name.textContent).toMatch("key | project name");
});

test("show loading", async () => {
  const store = createPureStore();
  store.dispatch(submitProjectId("key"));

  renderWrapper(
    <Provider store={store}>
      <ProjectInformation />
    </Provider>,
  );

  const skeleton = screen.queryByTestId("skeleton");

  expect(skeleton).not.toBeNull();
});

test("select project on editor", async () => {
  const store = createPureStore();

  renderWrapper(
    <Provider store={store}>
      <ProjectInformation />
    </Provider>,
  );

  act(() => {
    store.dispatch(projects.loadProjectsSucceeded({ projects: [{ id: "id", key: "key", name: "name" }] }));
  });

  await userEvent.click(screen.getByTestId("top/editButton"));
  await userEvent.click(screen.getByTestId("editor/suggestor/open"));
  await userEvent.click(screen.getByText(/name/));
  await userEvent.click(screen.getByTestId("editor/submit"));

  expect(screen.queryByTestId("skeleton")).not.toBeNull();

  act(() => {
    store.dispatch(submitProjectIdFulfilled(randomProject({ id: "id", key: "key", name: "name" })));
  });

  expect(screen.queryByText("key | name")).not.toBeNull();
});
