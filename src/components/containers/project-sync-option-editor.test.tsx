// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from "react";
import test from "ava";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Provider } from "react-redux";
import { ProjectSyncOptionEditor } from "./project-sync-option-editor";
import { createPureStore } from "@/state/store";
import { submitApiCredentialFulfilled, submitProjectKeyFulfilled } from "@/state/actions";
import { projectFactory } from "@/model/project";

test.afterEach(cleanup);

const wrappedRender = (v: React.ReactElement) =>
  render(v, {
    wrapper(props) {
      return (
        <>
          {props.children}
          <div id='modal-root' />
        </>
      );
    },
  });

test.serial("should be able to render", async (t) => {
  const store = createPureStore();

  wrappedRender(
    <Provider store={store}>
      <ProjectSyncOptionEditor />
    </Provider>,
  );

  const dialog = screen.getByTestId("form-dialog/dialog");

  t.is(dialog.getAttribute("aria-hidden"), "true");
});

test.serial("open dialog when opener clicked", async (t) => {
  const store = createPureStore();
  store.dispatch(submitProjectKeyFulfilled(projectFactory({ id: "1", key: "key", name: "name" })));
  store.dispatch(
    submitApiCredentialFulfilled({
      apiBaseUrl: "url",
      apiKey: "key",
      email: "email",
      token: "token",
      userDomain: "domain",
    }),
  );

  wrappedRender(
    <Provider store={store}>
      <ProjectSyncOptionEditor />
    </Provider>,
  );

  await userEvent.click(screen.getByTestId("opener"));

  const dialog = screen.getByTestId("form-dialog/dialog");

  t.is(dialog.getAttribute("aria-hidden"), "false");
});

test.serial("close dialog after finished to edit search condition", async (t) => {
  const store = createPureStore();
  store.dispatch(submitProjectKeyFulfilled(projectFactory({ id: "1", key: "key", name: "name" })));
  store.dispatch(
    submitApiCredentialFulfilled({
      apiBaseUrl: "url",
      apiKey: "key",
      email: "email",
      token: "token",
      userDomain: "domain",
    }),
  );

  wrappedRender(
    <Provider store={store}>
      <ProjectSyncOptionEditor />
    </Provider>,
  );

  await userEvent.click(screen.getByTestId("opener"));
  await userEvent.click(screen.getByTestId("form/cancel"));

  const dialog = screen.getByTestId("form-dialog/dialog");

  t.is(dialog.getAttribute("aria-hidden"), "true");
});
