import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Provider } from "react-redux";
import { ProjectSyncOptionEditor } from "./project-sync-option-editor";
import { createPureStore } from "@/state/store";
import { submitApiCredentialFulfilled, submitProjectKeyFulfilled } from "@/state/actions";
import { projectFactory } from "@/model/project";

afterEach(cleanup);

const wrappedRender = (v: React.ReactElement) =>
  render(v, {
    wrapper(props) {
      return (
        <>
          {props.children}
          <div id='dialog-root' />
        </>
      );
    },
  });

test("should be able to render", async () => {
  const store = createPureStore();

  wrappedRender(
    <Provider store={store}>
      <ProjectSyncOptionEditor />
    </Provider>,
  );

  const dialog = screen.getByTestId("form-dialog/dialog");

  expect(dialog.getAttribute("aria-hidden")).toBe("true");
});

test("open dialog when opener clicked", async () => {
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

  expect(dialog.getAttribute("aria-hidden")).toBe("false");
});

test("close dialog after finished to edit search condition", async () => {
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

  expect(dialog.getAttribute("aria-hidden")).toBe("true");
});
