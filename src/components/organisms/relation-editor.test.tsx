import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Provider } from "react-redux";
import { RelationEditor } from "./relation-editor";
import { createPureStore } from "@/state/store";
import {
  selectIssueInGraph,
  submitProjectIdFulfilled,
  synchronizeIssues,
  synchronizeIssuesFulfilled,
} from "@/state/actions";
import { randomIssue, randomProject } from "@/mock-data";

afterEach(cleanup);

const renderWrapper = (v: React.ReactElement) =>
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
  renderWrapper(
    <Provider store={store}>
      <RelationEditor kind="inward" />
    </Provider>,
  );

  const title = screen.getByTestId("title");
  const issues = screen.queryAllByTestId("issue/root");

  expect(title.textContent).toBe("Inward issues");
  expect(issues).toHaveLength(0);
});

test("render issues in inward", async () => {
  const issues = [
    randomIssue({ key: "key", relations: [{ id: "id", externalId: "id", inwardIssue: "foo", outwardIssue: "key" }] }),
    randomIssue({ key: "foo", relations: [{ id: "id", externalId: "id", inwardIssue: "foo", outwardIssue: "key" }] }),
  ];
  const store = createPureStore();
  store.dispatch(submitProjectIdFulfilled(randomProject()));
  store.dispatch(synchronizeIssuesFulfilled(issues));
  store.dispatch(selectIssueInGraph("key"));

  renderWrapper(
    <Provider store={store}>
      <RelationEditor kind="inward" />
    </Provider>,
  );

  const issueElements = screen.queryAllByTestId("issue/root");

  expect(issueElements).toHaveLength(1);
});

test("render skeleton", async () => {
  const store = createPureStore();
  store.dispatch(submitProjectIdFulfilled(randomProject()));
  store.dispatch(synchronizeIssues());

  renderWrapper(
    <Provider store={store}>
      <RelationEditor kind="inward" />
    </Provider>,
  );

  const skeleton = screen.queryByTestId("skeleton");

  expect(skeleton).not.toBeNull();
});

test("show input when button clicked", async () => {
  const issues = [randomIssue({ key: "key" }), randomIssue({ key: "key2" })];
  const store = createPureStore();
  store.dispatch(submitProjectIdFulfilled(randomProject()));
  store.dispatch(synchronizeIssuesFulfilled(issues));
  store.dispatch(selectIssueInGraph("key"));

  renderWrapper(
    <Provider store={store}>
      <RelationEditor kind="inward" />
    </Provider>,
  );

  const button = screen.getByTestId("appender/add-button");
  await userEvent.click(button);

  const input = screen.queryByTestId("appender/suggestion-list/term");

  expect(input).not.toBeNull();
});

test("re-display button after press enter in input", async () => {
  const issues = [randomIssue({ key: "key" }), randomIssue({ key: "key2" })];
  const store = createPureStore();
  store.dispatch(submitProjectIdFulfilled(randomProject()));
  store.dispatch(synchronizeIssuesFulfilled(issues));
  store.dispatch(selectIssueInGraph("key"));

  renderWrapper(
    <Provider store={store}>
      <RelationEditor kind="inward" />
    </Provider>,
  );

  const button = screen.getByTestId("appender/add-button");
  await userEvent.click(button);

  const input = screen.getByTestId("appender/suggestion-list/term");

  await userEvent.type(input, "foo{enter}");

  expect(screen.queryByTestId("appender/suggestion-list/term")).toBeNull();
});

test("do not display issue in suggestion that are already had relation", async () => {
  const issues = [
    randomIssue({ key: "key", relations: [{ id: "id", externalId: "id", inwardIssue: "key", outwardIssue: "key2" }] }),
    randomIssue({ key: "key2", relations: [{ id: "id", externalId: "id", inwardIssue: "key", outwardIssue: "key2" }] }),
    randomIssue({ key: "key3" }),
  ];
  const store = createPureStore();
  store.dispatch(submitProjectIdFulfilled(randomProject()));
  store.dispatch(synchronizeIssuesFulfilled(issues));
  store.dispatch(selectIssueInGraph("key"));

  renderWrapper(
    <Provider store={store}>
      <RelationEditor kind="outward" />
    </Provider>,
  );

  const button = screen.getByTestId("appender/add-button");
  await userEvent.click(button);

  const input = screen.getByTestId("appender/suggestion-list/term");

  await userEvent.type(input, "key");

  const suggestions = screen.getAllByTestId("appender/suggestion-list/suggestion");

  expect(suggestions).toHaveLength(1);
  expect(suggestions[0].textContent).toContain("key3");
});
