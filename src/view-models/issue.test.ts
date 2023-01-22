import { test, expect } from "vitest";
import { issueToIssueModel } from "./issue";
import { randomIssue, randomProject } from "@/mock-data";

test("get simplest issue", () => {
  const project = randomProject();
  const issue = randomIssue({
    statusId: "-1",
    typeId: "-1",
  });

  const ret = issueToIssueModel(project, issue);

  expect(ret).toEqual({ key: issue.key, summary: issue.summary });
});

test("get issue model with status and type", () => {
  const project = randomProject();
  const issue = randomIssue({
    statusId: Object.keys(project.statuses)[0],
    typeId: Object.keys(project.issueTypes)[0],
  });

  const ret = issueToIssueModel(project, issue);

  expect(ret).toEqual({
    key: issue.key,
    summary: issue.summary,
    issueType: Object.values(project.issueTypes)[0],
    issueStatus: Object.values(project.statuses)[0],
  });
});
