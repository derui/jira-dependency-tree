// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from "react";
import test from "ava";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Provider } from "react-redux";
import { ProjectSyncOptionEditorDialog } from "./project-sync-option-editor-form";
import { createPureStore } from "@/state/store";
import { submitProjectKeyFulfilled } from "@/state/actions";
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

test.serial("should be able to render", (t) => {
  const store = createPureStore();

  wrappedRender(
    <Provider store={store}>
      <ProjectSyncOptionEditorDialog onClose={() => {}} />
    </Provider>,
  );

  const select = screen.getByTestId("condition-type") as HTMLSelectElement;

  t.is(select.value, "default");
});

test.serial("show epic when condition is changed to epic", async (t) => {
  const store = createPureStore();

  wrappedRender(
    <Provider store={store}>
      <ProjectSyncOptionEditorDialog onClose={() => {}} />
    </Provider>,
  );

  const select = screen.getByTestId("condition-type") as HTMLSelectElement;
  await userEvent.selectOptions(select, "epic");
  const epic = screen.getByTestId("epic");

  t.is(select.value, "epic");
  t.is(epic.getAttribute("aria-hidden"), "false");
});

test.serial("close when cancel clicked", async (t) => {
  t.plan(1);
  const store = createPureStore();

  wrappedRender(
    <Provider store={store}>
      <ProjectSyncOptionEditorDialog
        onClose={() => {
          t.pass();
        }}
      />
    </Provider>,
  );

  const cancel = screen.getByTestId("cancel");
  await userEvent.click(cancel);
});

test.serial("change to epic", async (t) => {
  const store = createPureStore();
  store.dispatch(submitProjectKeyFulfilled(projectFactory({ key: "key", id: "1", name: "test" })));

  wrappedRender(
    <Provider store={store}>
      <ProjectSyncOptionEditorDialog onClose={() => {}} />
    </Provider>,
  );

  await userEvent.selectOptions(screen.getByTestId("condition-type"), "epic");
  await userEvent.type(screen.getByTestId("epic-input/input"), "A-B");

  const submit = screen.getByTestId("submit");
  await userEvent.click(submit);

  t.deepEqual(store.getState().project.searchCondition, {
    projectKey: "key",
    epic: "A-B",
  });
});
