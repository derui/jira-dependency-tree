import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Provider } from "react-redux";
import React from "react";
import { ProjectInformation } from "./project-information";
import { createPureStore } from "@/state/store";
import { submitProjectKeyFulfilled } from "@/state/actions";
import { projectFactory } from "@/model/project";

afterEach(cleanup);

const renderWrapper = (node: React.ReactElement) =>
  render(node, {
    wrapper(props) {
      return (
        <>
          {props.children}
          <div id='dialog-root' />
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

  const span = screen.queryByText("Click here");
  const marker = screen.getByTestId("marker");

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

  await userEvent.click(screen.getByText("Click here"));

  const dialog = screen.getByTestId("container/dialog");

  expect(dialog.getAttribute("aria-hidden")).toBe("false");
});

test("send key and loading state", async () => {
  const store = createPureStore();

  renderWrapper(
    <Provider store={store}>
      <ProjectInformation />
    </Provider>,
  );

  await userEvent.click(screen.getByText("Click here"));
  await userEvent.type(screen.getByTestId("form/key"), "key");
  await userEvent.click(screen.getByTestId("form/submit"));

  const skeleton = screen.queryByTestId("skeleton");
  const dialog = screen.getByTestId("container/dialog");

  expect(skeleton?.classList?.contains("hidden"), "skeleton").toBeFalsy();
  expect(dialog.getAttribute("aria-hidden")).toBe("true");
});

test("show project name ", async () => {
  const store = createPureStore();

  renderWrapper(
    <Provider store={store}>
      <ProjectInformation />
    </Provider>,
  );

  await userEvent.click(screen.getByText("Click here"));
  await userEvent.type(screen.getByTestId("form/key"), "key");
  await userEvent.click(screen.getByTestId("form/submit"));

  store.dispatch(submitProjectKeyFulfilled(projectFactory({ key: "key", id: "id", name: "project name" })));

  const name = await screen.findByText("project name");

  expect(name.textContent).toEqual("project name");
});
