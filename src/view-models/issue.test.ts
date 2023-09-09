import { test, expect } from "vitest";
import { IssueModel, issueToIssueModel } from "./issue";
import { randomIssue } from "@/mock/generators";

test("get simplest issue", () => {
  const issue = randomIssue();

  const ret = issueToIssueModel(issue);

  expect(ret).toEqual({ key: issue.key, summary: issue.summary, issueType: issue.type, issueStatus: issue.status });
});

test("get issue model with status and type", () => {
  const issue = randomIssue({
    status: {
      id: "1",
      name: "name",
      statusCategory: "DONE",
    },
    type: {
      id: "2",
      name: "name",
      avatarUrl: "url",
    },
  });

  const ret = issueToIssueModel(issue);

  expect(ret).toEqual({
    key: issue.key,
    summary: issue.summary,
    issueType: issue.type,
    issueStatus: issue.status,
  } as IssueModel);
});
