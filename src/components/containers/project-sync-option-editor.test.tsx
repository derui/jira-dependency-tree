import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Provider } from "react-redux";
import { ProjectSyncOptionEditor } from "./project-sync-option-editor";
import { createPureStore } from "@/state/store";
import { submitApiCredentialFulfilled, submitProjectIdFulfilled } from "@/state/actions";
import { projectFactory } from "@/model/project";

afterEach(cleanup);

const wrappedRender = (v: React.ReactElement) =>
  render(v, {
    wrapper(props) {
      return (
        <>
          {props.children}
          <div id="dialog-root" />
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
  const button = screen.getByTestId("opener");

  expect(dialog.getAttribute("aria-hidden")).toBe("true");
  expect(button.getAttribute("disabled")).toBe("");
});

test("open dialog when opener clicked", async () => {
  const store = createPureStore();
  store.dispatch(submitProjectIdFulfilled(projectFactory({ id: "1", key: "key", name: "name" })));
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
  const button = screen.getByTestId("opener") as HTMLButtonElement;

  expect(button.disabled).toBe(false);
  expect(button.classList.contains("bg-secondary1-200")).toBe(true);
  expect(dialog.getAttribute("aria-hidden")).toBe("false");
});

test("close dialog after finished to edit search condition", async () => {
  const store = createPureStore();
  store.dispatch(submitProjectIdFulfilled(projectFactory({ id: "1", key: "key", name: "name" })));
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
  const button = screen.getByTestId("opener") as HTMLButtonElement;

  expect(button.disabled).toBe(false);
  expect(button.classList.contains("bg-secondary1-200")).toBe(false);
  expect(dialog.getAttribute("aria-hidden")).toBe("true");
});

test("show current value in button", async () => {
  const store = createPureStore();
  store.dispatch(submitProjectIdFulfilled(projectFactory({ id: "1", key: "key", name: "name" })));
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

  const button = screen.getByTestId("opener") as HTMLButtonElement;

  expect(button.disabled).toBe(false);
  expect(button.classList.contains("bg-secondary1-200")).toBe(false);
  expect(button.textContent).toContain("Current Sprint");
});
