import { test, expect } from "vitest";
import { clearIssueFilter, expandIssue, filterIssues, importIssues, narrowExpandedIssue } from "../actions";
import { getInitialState, reducer } from "./issues";
import { Issue } from "@/model/issue";
import { randomIssue } from "@/mock-data";

test("initial state", () => {
  expect(getInitialState()).toEqual({
    issues: {},
    matchedIssues: [],
    _originalIssues: [],
    projectionTarget: { kind: "Root" },
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

test("loaded issues with other projection target", () => {
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
    parentIssue: "key2",
    subIssues: [],
  };
  const issue2: Issue = {
    key: "key2",
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
    subIssues: ["key"],
  };
  let ret = reducer(getInitialState(), expandIssue("key2"));
  ret = reducer(ret, importIssues({ issues: [issue, issue2] }));

  expect(ret.issues).toEqual(expect.objectContaining({ [issue.key]: issue }));
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

test("projection target is parent issue", () => {
  const issues: Issue[] = [
    randomIssue({ key: "key1", parentIssue: "key3" }),
    randomIssue({ key: "key2" }),
    randomIssue({ key: "key3" }),
  ];
  let ret = reducer(getInitialState(), importIssues({ issues }));
  ret = reducer(ret, expandIssue("key3"));

  expect(ret.issues).toEqual(expect.objectContaining({ [issues[0].key]: issues[0] }));
});

test("restore projection target", () => {
  const issues: Issue[] = [
    randomIssue({ key: "key1", parentIssue: "key3" }),
    randomIssue({ key: "key2" }),
    randomIssue({ key: "key3" }),
  ];
  let ret = reducer(getInitialState(), importIssues({ issues }));
  ret = reducer(ret, expandIssue("key3"));
  ret = reducer(ret, narrowExpandedIssue());

  expect(ret.issues).toEqual(expect.objectContaining({ [issues.slice(1)[0].key]: issues.slice(1)[0] }));
});
