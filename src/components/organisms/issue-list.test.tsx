import { test, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Provider } from "react-redux";
import { IssueList } from "./issue-list";
import { createStore } from "@/status/store";
import { importIssues } from "@/status/actions";
import { randomIssue } from "@/mock/generators";

vi.mock("@/hooks/focus-issue", () => {
  return {
    useFocusIssue: vi.fn(),
  };
});

afterEach(cleanup);
afterEach(() => {
  vi.clearAllMocks();
});

test("should be able to render", () => {
  const store = createStore();

  render(
    <Provider store={store}>
      <IssueList />
    </Provider>,
  );
});

test("display empty if no issues", () => {
  const store = createStore();

  render(
    <Provider store={store}>
      <div id="panel-root" />
      <IssueList opened />
    </Provider>,
  );

  expect(screen.queryByText("No issues")).not.toBeNull();
});

test("display issues in list", () => {
  const store = createStore();
  store.dispatch(importIssues({ issues: [randomIssue({ key: "key" })] }));

  render(
    <Provider store={store}>
      <div id="panel-root" />
      <IssueList opened />
    </Provider>,
  );

  expect(screen.queryByText("key")).not.toBeNull();
  expect(screen.queryByText("No issues")).toBeNull();
});

test("filter issues with filling query input", async () => {
  const user = userEvent.setup();
  const store = createStore();
  store.dispatch(
    importIssues({
      issues: [randomIssue({ key: "key-1" }), randomIssue({ key: "key-2" }), randomIssue({ key: "other-3" })],
    }),
  );

  render(
    <Provider store={store}>
      <div id="panel-root" />
      <IssueList opened />
    </Provider>,
  );

  expect(screen.queryAllByRole("listitem")).toHaveLength(3);

  await user.type(screen.getByRole("textbox"), "key");

  expect(screen.queryAllByRole("listitem")).toHaveLength(2);
});
