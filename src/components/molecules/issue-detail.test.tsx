import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Sinon from "sinon";
import { IssueDetail } from "./issue-detail";
import { issueToIssueModel } from "@/view-models/issue";
import { randomIssue } from "@/mock/generators";

afterEach(cleanup);

const issue = issueToIssueModel(randomIssue({ key: "key", summary: "this is summary" }));

test("should be able to render", () => {
  render(<IssueDetail issue={issue} />);

  expect(screen.queryByText("key")).not.toBeNull();
  expect(screen.queryByText("this is summary")).not.toBeNull();
  expect(screen.queryByText(issue.issueStatus?.name ?? "")).not.toBeNull();
  expect(screen.queryByText(issue.issueType?.name ?? "")).not.toBeNull();
});

test("call remove handler", async () => {
  const user = userEvent.setup();
  const mock = Sinon.fake();
  render(<IssueDetail issue={issue} onRemove={mock} />);

  await user.click(screen.getByTestId("remover"));

  expect(mock.calledWith(issue.key)).toBeTruthy();
});