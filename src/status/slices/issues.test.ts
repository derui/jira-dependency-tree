import { test, expect } from "vitest";
import { clearIssueFilter, filterIssues, importIssues, removeNode } from "../actions";
import { getInitialState, reducer } from "./issues";
import { Issue } from "@/models/issue";
import { randomIssue } from "@/mock/generators";

test("initial state", () => {
  expect(getInitialState()).toEqual({
    issues: {},
    matchedIssues: [],
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
  expect(ret.matchedIssues).toEqual([issue]);
});

test("get issue matched", () => {
  const issues: Issue[] = [
    {
      key: "key",
      summary: "summary",
      description: "description",
      status: {
        id: "",
        name: "",
        statusCategory: "DONE",
      },
      type: {
        id: "",
        name: "",
        avatarUrl: "",
      },
      selfUrl: "",
      relations: [],
      subIssues: [],
    },
    { key: "not match", summary: "not match" } as Issue satisfies Issue,
  ];
  let ret = reducer(getInitialState(), importIssues({ issues }));
  ret = reducer(ret, filterIssues("ke"));

  expect(ret.matchedIssues.length).toBe(1);
  expect(ret.matchedIssues).toEqual([issues[0]]);
});

test("empty matched issues if term is empty", () => {
  const issues: Issue[] = [
    {
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
    },
    { key: "not match", summary: "not match" } as Issue satisfies Issue,
  ];
  let ret = reducer(getInitialState(), importIssues({ issues }));
  ret = reducer(ret, clearIssueFilter());

  expect(ret.matchedIssues.length).toBe(0);
});

test("remove node from issues", () => {
  const issue = randomIssue({ key: "key1" });
  const issue2 = randomIssue({ key: "key2" });
  let ret = reducer(getInitialState(), importIssues({ issues: [issue, issue2] }));

  expect(ret.issues).toEqual(expect.objectContaining({ key1: issue, key2: issue2 }));

  ret = reducer(ret, removeNode("key2"));

  expect(ret.issues).toEqual({ key1: issue });
});
