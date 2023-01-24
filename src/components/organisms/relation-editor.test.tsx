import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Provider } from "react-redux";
import { RelationEditor } from "./relation-editor";
import { createPureStore } from "@/state/store";
import {
  searchIssue,
  selectIssueInGraph,
  submitProjectKeyFulfilled,
  synchronizeIssues,
  synchronizeIssuesFulfilled,
} from "@/state/actions";
import { randomIssue, randomProject } from "@/mock-data";

afterEach(cleanup);

test("should be able to render", async () => {
  const store = createPureStore();
  render(
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
  store.dispatch(submitProjectKeyFulfilled(randomProject()));
  store.dispatch(synchronizeIssuesFulfilled(issues));
  store.dispatch(selectIssueInGraph("key"));

  render(
    <Provider store={store}>
      <RelationEditor kind="inward" />
    </Provider>,
  );

  const issueElements = screen.queryAllByTestId("issue/root");

  expect(issueElements).toHaveLength(1);
});

test("render skeleton", async () => {
  const store = createPureStore();
  store.dispatch(submitProjectKeyFulfilled(randomProject()));
  store.dispatch(synchronizeIssues());

  render(
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
  store.dispatch(submitProjectKeyFulfilled(randomProject()));
  store.dispatch(synchronizeIssuesFulfilled(issues));
  store.dispatch(selectIssueInGraph("key"));

  render(
    <Provider store={store}>
      <RelationEditor kind="inward" />
    </Provider>,
  );

  const button = screen.getByTestId("appender/add-button/button");
  await userEvent.click(button);

  const input = screen.queryByTestId("appender/issue-term/input");

  expect(input).not.toBeNull();
});

test("re-display button after press enter in input", async () => {
  const issues = [randomIssue({ key: "key" }), randomIssue({ key: "key2" })];
  const store = createPureStore();
  store.dispatch(submitProjectKeyFulfilled(randomProject()));
  store.dispatch(synchronizeIssuesFulfilled(issues));
  store.dispatch(selectIssueInGraph("key"));

  render(
    <Provider store={store}>
      <RelationEditor kind="inward" />
    </Provider>,
  );

  const button = screen.getByTestId("appender/add-button/button");
  await userEvent.click(button);

  const input = screen.getByTestId("appender/issue-term/input");

  await userEvent.type(input, "foo{enter}");

  expect(screen.queryByTestId("appender/issue-term/input")).toBeNull();
});
