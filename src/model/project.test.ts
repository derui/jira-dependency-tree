import test from "ava";
import { projectFactory } from "@/model/project";
import { StatusCategory } from "@/type";

const issueTypes = [
  {
    id: "2",
    name: "Bug",
    avatarUrl: "http://localhost/foo",
  },
];
const statuses = [{ id: "1", name: "TODO", statusCategory: StatusCategory.TODO }];
const statusCategories = [{ id: "3", name: "TODO", colorName: "yellow" }];
const project = projectFactory({ id: "150", name: "project", key: "foo", statuses, issueTypes, statusCategories });

test("get issuetype by id", (t) => {
  // arrange

  // do
  const issueType = project.findIssueTypeBy("2");
  const notFound = project.findIssueTypeBy("3");

  // verify
  t.deepEqual(issueType, issueTypes[0]);
  t.is(notFound, undefined);
});

test("get issue status by id", (t) => {
  // arrange

  // do
  const status = project.findStatusBy("1");
  const notFound = project.findStatusBy("2");

  // verify
  t.deepEqual(status, statuses[0]);
  t.is(notFound, undefined);
});
