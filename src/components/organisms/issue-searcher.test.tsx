import { test, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Provider } from "react-redux";
import { IssueSearcher } from "./issue-searcher";
import { createStore } from "@/status/store";
import { importIssues } from "@/status/actions";
import { randomIssue } from "@/mock/generators";
import { useFocusIssue } from "@/hooks/focus-issue";

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
      <IssueSearcher />
    </Provider>,
  );

  const opener = screen.queryAllByTestId("issue/root");

  expect(opener).toHaveLength(0);
});

test("show issue are matched with inputted term", async () => {
  const user = userEvent.setup();
  const store = createStore();
  store.dispatch(
    importIssues({
      issues: [
        randomIssue({ key: "TES-10", summary: "summary" }),
        randomIssue({ key: "TES-11", summary: "other" }),
        randomIssue({ key: "OTHER-11", summary: "not match" }),
      ],
    }),
  );

  render(
    <Provider store={store}>
      <IssueSearcher />
    </Provider>,
  );

  await user.click(screen.getByTestId("input/opener"));
  await user.type(screen.getByTestId("input/input"), "TES");

  const issues = screen.getAllByTestId("issue/root");

  expect(issues).toHaveLength(2);
  expect(issues.some((v) => v.textContent?.includes("TES-10"))).toBeTruthy();
  expect(issues.some((v) => v.textContent?.includes("TES-11"))).toBeTruthy();
});

test("reset after click cancel", async () => {
  const store = createStore();
  store.dispatch(
    importIssues({
      issues: [
        randomIssue({ key: "TES-10", summary: "summary" }),
        randomIssue({ key: "TES-11", summary: "other" }),
        randomIssue({ key: "OTHER-11", summary: "not match" }),
      ],
    }),
  );

  render(
    <Provider store={store}>
      <IssueSearcher />
    </Provider>,
  );

  await userEvent.click(screen.getByTestId("input/opener"));
  await userEvent.type(screen.getByTestId("input/input"), "TES");
  await userEvent.click(screen.getByTestId("input/cancel"));

  const issues = screen.queryAllByTestId("issue/root");
  const term = screen.getByTestId("input/input") as HTMLInputElement;

  expect(issues).toHaveLength(0);
  expect(term.value).toBe("");
});

test("send action when issue click", async () => {
  const user = userEvent.setup();
  const store = createStore();
  store.dispatch(
    importIssues({
      issues: [
        randomIssue({ key: "TES-10", summary: "summary" }),
        randomIssue({ key: "TES-11", summary: "other" }),
        randomIssue({ key: "OTHER-11", summary: "not match" }),
      ],
    }),
  );
  const mockedFn = vi.fn();
  const mock = vi.mocked(useFocusIssue);
  mock.mockReturnValue(mockedFn);

  render(
    <Provider store={store}>
      <IssueSearcher />
    </Provider>,
  );

  await user.click(screen.getByTestId("input/opener"));
  await user.type(screen.getByTestId("input/input"), "TES-10");

  const issue = screen.getByTestId("issue/root");
  await user.click(issue);

  expect(mockedFn).toBeCalledWith("TES-10");
});
