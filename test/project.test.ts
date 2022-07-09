import { Project } from "@/project";
import { ISSUE_CATEGORY } from "@/type";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const test = suite("project");

const issueTypes = [
  {
    id: "2",
    name: "Bug",
    avatarUrl: "http://localhost/foo",
  },
];
const statuses = [{ id: "1", name: "TODO", category: ISSUE_CATEGORY.TODO }];
const project = new Project({ id: "150", key: "foo", statuses, issueTypes });

test("get issuetype by id", () => {
  // arrange

  // do
  const issueType = project.findIssueTypeBy("2");
  const notFound = project.findIssueTypeBy("3");

  // verify
  assert.equal(issueType, issueTypes[0]);
  assert.is(notFound, undefined);
});

test("get issue status by id", () => {
  // arrange

  // do
  const status = project.findStatusBy("1");
  const notFound = project.findStatusBy("2");

  // verify
  assert.equal(status, statuses[0]);
  assert.is(notFound, undefined);
});

test.run();
