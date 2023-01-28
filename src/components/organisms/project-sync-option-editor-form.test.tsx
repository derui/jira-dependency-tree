import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Provider } from "react-redux";
import { ProjectSyncOptionEditorForm } from "./project-sync-option-editor-form";
import { createPureStore } from "@/state/store";
import { submitProjectKeyFulfilled } from "@/state/actions";
import { projectFactory } from "@/model/project";

afterEach(cleanup);

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

test("should be able to render", () => {
  const store = createPureStore();

  wrappedRender(
    <Provider store={store}>
      <ProjectSyncOptionEditorForm onClose={() => {}} />
    </Provider>,
  );

  const select = screen.getByTestId("condition-type") as HTMLSelectElement;

  expect(select.value).toBe("default");
});

test("show epic when condition is changed to epic", async () => {
  const store = createPureStore();

  wrappedRender(
    <Provider store={store}>
      <ProjectSyncOptionEditorForm onClose={() => {}} />
    </Provider>,
  );

  const select = screen.getByTestId("condition-type") as HTMLSelectElement;
  await userEvent.selectOptions(select, "epic");
  const epic = screen.getByTestId("epic");

  expect(select.value).toBe("epic");
  expect(epic.getAttribute("aria-hidden")).toBe("false");
});

test("close when cancel clicked", async () => {
  expect.assertions(1);

  const store = createPureStore();

  wrappedRender(
    <Provider store={store}>
      <ProjectSyncOptionEditorForm
        onClose={() => {
          expect(true).toBeTruthy();
        }}
      />
    </Provider>,
  );

  const cancel = screen.getByTestId("cancel");
  await userEvent.click(cancel);
});

test("change to epic", async () => {
  const store = createPureStore();
  store.dispatch(submitProjectKeyFulfilled(projectFactory({ key: "key", id: "1", name: "test" })));

  wrappedRender(
    <Provider store={store}>
      <ProjectSyncOptionEditorForm onClose={() => {}} />
    </Provider>,
  );

  await userEvent.selectOptions(screen.getByTestId("condition-type"), "epic");
  await userEvent.type(screen.getByTestId("epic-input"), "A-B");

  const submit = screen.getByTestId("submit");
  await userEvent.click(submit);

  expect(store.getState().project.searchCondition).toEqual({
    projectKey: "key",
    epic: "A-B",
  });
});

test("show button when it is not editing", async () => {
  const store = createPureStore();
  store.dispatch(submitProjectKeyFulfilled(projectFactory({ key: "key", id: "1", name: "test" })));

  wrappedRender(
    <Provider store={store}>
      <ProjectSyncOptionEditorForm onClose={() => {}} />
    </Provider>,
  );

  await userEvent.selectOptions(screen.getByTestId("condition-type"), "sprint");

  const button = screen.queryByTestId("open-suggestion");

  expect(button).not.toBeNull();
});

test("show term input when open-suggestion clicked", async () => {
  const store = createPureStore();
  store.dispatch(submitProjectKeyFulfilled(projectFactory({ key: "key", id: "1", name: "test" })));

  wrappedRender(
    <Provider store={store}>
      <ProjectSyncOptionEditorForm onClose={() => {}} />
    </Provider>,
  );

  await userEvent.selectOptions(screen.getByTestId("condition-type"), "sprint");

  const button = screen.getByTestId("open-suggestion");
  await userEvent.click(button);

  const input = screen.getByTestId("suggested-sprint/term") as HTMLInputElement;

  expect(input.value).toBe("");
});

test("show button again when type enter in term", async () => {
  const store = createPureStore();
  store.dispatch(submitProjectKeyFulfilled(projectFactory({ key: "key", id: "1", name: "test" })));

  wrappedRender(
    <Provider store={store}>
      <ProjectSyncOptionEditorForm onClose={() => {}} />
    </Provider>,
  );

  await userEvent.selectOptions(screen.getByTestId("condition-type"), "sprint");

  await userEvent.click(screen.getByTestId("open-suggestion"));

  const input = screen.getByTestId("suggested-sprint/term") as HTMLInputElement;
  await userEvent.type(input, "key{enter}");

  const button = screen.getByTestId("open-suggestion");

  expect(button.textContent).toBe("Click to select sprint");
});
