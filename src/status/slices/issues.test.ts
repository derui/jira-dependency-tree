import { test, expect } from "vitest";
import { importIssues, removeNode } from "../actions";
import { getInitialState, reducer } from "./issues";
import { Issue } from "@/models/issue";
import { randomIssue } from "@/mock/generators";

test("initial state", () => {
  expect(getInitialState()).toEqual({
    issues: {},
  });
});

test("loaded issues", () => {
  const issue: Issue = {
    key: "key",
    summary: "summary",
    description: "description",
    status: {
      id: "",
      name: "",
      statusCategory: "TODO",
    },
    type: {
      id: "",
      name: "",
      avatarUrl: "",
    },
    selfUrl: "",
    relations: [],
    subIssues: [],
  };

  const ret = reducer(getInitialState(), importIssues({ issues: [issue] }));

  expect(ret.issues).toEqual({ key: issue });
});

test("remove node from issues", () => {
  const issue = randomIssue({ key: "key1" });
  const issue2 = randomIssue({ key: "key2" });
  let ret = reducer(getInitialState(), importIssues({ issues: [issue, issue2] }));

  expect(ret.issues).toEqual(expect.objectContaining({ key1: issue, key2: issue2 }));

  ret = reducer(ret, removeNode("key2"));

  expect(ret.issues).toEqual({ key1: issue });
});
