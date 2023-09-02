import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Provider } from "react-redux";
import { v4 } from "uuid";
import { RelationEditor } from "./relation-editor";
import { createStore } from "@/state/store";
import { randomIssue } from "@/mock-data";
import { createDependencyRegistrar } from "@/util/dependency-registrar";
import { Dependencies } from "@/dependencies";
import { RegistrarContext } from "@/registrar-context";
import { importIssues } from "@/state/actions";

const registrar = createDependencyRegistrar<Dependencies>();
registrar.register("generateId", () => v4());

afterEach(cleanup);

const renderWrapper = (v: React.ReactElement) =>
  render(v, {
    wrapper(props) {
      return (
        <RegistrarContext.Provider value={registrar}>
          {props.children}
          <div id="dialog-root" />
        </RegistrarContext.Provider>
      );
    },
  });

test("should be able to render", async () => {
  const store = createStore();
  renderWrapper(
    <Provider store={store}>
      <RelationEditor />
    </Provider>,
  );

  expect(screen.queryByTestId("appender/root")).not.toBeNull();
  expect(screen.queryByTestId("preparation/root")).toBeNull();
  expect(screen.queryAllByTestId("draft/root")).toHaveLength(0);
  expect(screen.getByText("Apply drafts").getAttribute("disabled")).not.toBeNull();
});

test("show preparation after click appender", async () => {
  const user = userEvent.setup();
  const store = createStore();

  renderWrapper(
    <Provider store={store}>
      <RelationEditor />
    </Provider>,
  );

  await user.click(screen.getByTestId("appender/root"));

  expect(screen.queryByTestId("appender/root")).toBeNull();
  expect(screen.queryByTestId("preparation/root")).not.toBeNull();
});

test("show draft if relation exists", async () => {
  const store = createStore();

  store.dispatch(
    importIssues({
      issues: [
        randomIssue({ key: "key1", relations: [{ id: "1", inwardIssue: "key1", outwardIssue: "key2" }] }),
        randomIssue({ key: "key2", relations: [{ id: "1", inwardIssue: "key1", outwardIssue: "key2" }] }),
      ],
    }),
  );

  renderWrapper(
    <Provider store={store}>
      <RelationEditor />
    </Provider>,
  );

  expect(screen.queryAllByTestId("draft/no-touched")).toHaveLength(1);
});

test("enable apply button when any draft is appeared", async () => {
  const user = userEvent.setup();
  const store = createStore();

  store.dispatch(
    importIssues({
      issues: [
        randomIssue({ key: "key1", relations: [{ id: "1", inwardIssue: "key1", outwardIssue: "key2" }] }),
        randomIssue({ key: "key2", relations: [{ id: "1", inwardIssue: "key1", outwardIssue: "key2" }] }),
      ],
    }),
  );

  renderWrapper(
    <Provider store={store}>
      <RelationEditor />
    </Provider>,
  );

  await user.click(screen.getByTestId("draft/arrow/deleter"));

  expect(screen.queryAllByTestId("draft/touched")).toHaveLength(1);
  expect(screen.queryAllByTestId("draft/no-touched")).toHaveLength(0);
  expect(screen.getByText("Apply drafts").getAttribute("disabled")).toBeNull();
});

test("filter relation which contains search term", async () => {
  const user = userEvent.setup();
  const store = createStore();

  store.dispatch(
    importIssues({
      issues: [
        randomIssue({ key: "key1", relations: [{ id: "1", inwardIssue: "key1", outwardIssue: "key2" }] }),
        randomIssue({ key: "key2", relations: [{ id: "1", inwardIssue: "key1", outwardIssue: "key2" }] }),
        randomIssue({ key: "key3", relations: [{ id: "2", inwardIssue: "key3", outwardIssue: "key4" }] }),
        randomIssue({ key: "key4", relations: [{ id: "2", inwardIssue: "key3", outwardIssue: "key4" }] }),
      ],
    }),
  );

  renderWrapper(
    <Provider store={store}>
      <RelationEditor />
    </Provider>,
  );

  await user.click(screen.getByTestId("search-input/opener"));
  expect(screen.queryAllByTestId("draft/no-touched")).toHaveLength(2);

  await user.type(screen.getByTestId("search-input/input"), "key4");

  expect(screen.queryAllByTestId("draft/no-touched")).toHaveLength(1);
});
