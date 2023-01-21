import { test, expect } from "vitest";
import { searchIssue, synchronizeIssues, synchronizeIssuesFulfilled } from "../actions";
import { getInitialState, reducer } from "./issues";
import { Loading } from "@/type";
import { Issue } from "@/model/issue";

test("initial state", () => {
  expect(getInitialState()).toEqual({ issues: [], loading: Loading.Completed, matchedIssues: [] });
});

test("loading", () => {
  const ret = reducer(getInitialState(), synchronizeIssues());

  expect(ret.loading).toBe(Loading.Loading);
  expect(ret.issues).toEqual([]);
});

test("loaded issues", () => {
  const issue = {
    key: "key",
    summary: "summary",
    description: "description",
    statusId: "",
    typeId: "",
    selfUrl: "",
    relations: [],
  };
  const ret = reducer(getInitialState(), synchronizeIssuesFulfilled([issue]));

  expect(ret.issues.length).toBe(1);
  expect(ret.issues[0]).toEqual(issue);
  expect(ret.loading).toBe(Loading.Completed);
});

test("get issue matched", () => {
  const issues: Issue[] = [
    {
      key: "key",
      summary: "summary",
      description: "description",
      statusId: "",
      typeId: "",
      selfUrl: "",
      relations: [],
    },
    { key: "not match", summary: "not match" } as Issue satisfies Issue,
  ];
  let ret = reducer(getInitialState(), synchronizeIssuesFulfilled(issues));
  ret = reducer(ret, searchIssue("ke"));

  expect(ret.matchedIssues.length).toBe(1);
  expect(ret.matchedIssues).toEqual([issues[0]]);
});

test("empty matched issues if term is empty", () => {
  const issues: Issue[] = [
    {
      key: "key",
      summary: "summary",
      description: "description",
      statusId: "",
      typeId: "",
      selfUrl: "",
      relations: [],
    },
    { key: "not match", summary: "not match" } as Issue satisfies Issue,
  ];
  let ret = reducer(getInitialState(), synchronizeIssuesFulfilled(issues));
  ret = reducer(ret, searchIssue(""));

  expect(ret.matchedIssues.length).toBe(0);
});
