import { test, expect } from "vitest";
import { IssueModel, isLoadedIssueModel, isLoadingIssueModel, issueToIssueModel, makeLoadingIssue } from "./issue";
import { randomIssue } from "@/mock/generators";

test("get simplest issue", () => {
  const issue = randomIssue();

  const ret = issueToIssueModel(issue);

  if (isLoadedIssueModel(ret)) {
    expect(ret.key).toEqual(issue.key);
    expect(ret.summary).toEqual(issue.summary);
    expect(ret.issueType).toEqual(issue.type);
    expect(ret.issueStatus).toEqual(issue.status);
  } else {
    expect.fail("");
  }
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

  if (!isLoadedIssueModel(ret)) {
    expect.fail();
  }

  expect(ret.key).toEqual(issue.key);
  expect(ret.summary).toEqual(issue.summary);
  expect(ret.issueType).toEqual(issue.type);
  expect(ret.issueStatus).toEqual(issue.status);
});

test("make loading issue model", () => {
  const ret = makeLoadingIssue("key");

  if (!isLoadingIssueModel(ret)) {
    expect.fail();
  }

  expect(isLoadingIssueModel).toBeTruthy();
  expect(ret.key).toEqual("key");
});
