import { test, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Provider } from "react-redux";
import { IssueNode } from "./issue-node";
import { createStore } from "@/status/store";
import { randomIssue } from "@/mock/generators";
import { useSelectNode } from "@/hooks";
import { issueToIssueModel } from "@/view-models/issue";
import { IssueModelWithLayout } from "@/view-models/graph-layout";

vi.mock("@/hooks", () => {
  const select = vi.fn();
  return {
    useSelectNode: () => ({
      select,
    }),
  };
});

afterEach(cleanup);
afterEach(() => {
  vi.clearAllMocks();
});

const issue = issueToIssueModel(randomIssue());
const layout: IssueModelWithLayout = {
  issue,
  position: { x: 1, y: 2 },
  size: { width: 100, height: 50 },
  meta: {
    colIndex: 0,
    rowIndex: 0,
  },
};

test("should be able to render", () => {
  const store = createStore();

  render(
    <Provider store={store}>
      <IssueNode layout={layout} />
    </Provider>,
  );

  const opener = screen.queryAllByTestId("issue/root");

  expect(opener).toHaveLength(1);
});

test("call select when issue clicked", async () => {
  const user = userEvent.setup();
  const store = createStore();
  const mock = vi.mocked(useSelectNode)().select;

  render(
    <Provider store={store}>
      <IssueNode layout={layout} />
    </Provider>,
  );

  await user.click(screen.getByTestId("issue/root"));

  expect(mock).toBeCalledWith(issue.key);
});
