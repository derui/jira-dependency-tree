import { test, expect } from "vitest";
import {
  addRelationSucceeded,
  removeRelationSucceeded,
  searchIssue,
  synchronizeIssues,
  synchronizeIssuesFulfilled,
} from "../actions";
import { getInitialState, reducer } from "./issues";
import { Loading } from "@/type";
import { Issue } from "@/model/issue";
import { randomIssue } from "@/mock-data";

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

test("update relation when adding relation is successed", () => {
  const issues: Issue[] = [randomIssue({ key: "key1", relations: [] }), randomIssue({ key: "key2", relations: [] })];
  let ret = reducer(getInitialState(), synchronizeIssuesFulfilled(issues));
  ret = reducer(
    ret,
    addRelationSucceeded({
      id: "id",
      externalId: "id",
      inwardIssue: "key1",
      outwardIssue: "key2",
    }),
  );

  const map = new Map(ret.issues.map((v) => [v.key, v]));

  expect(map.get("key1")?.relations).toEqual([
    { id: "id", externalId: "id", inwardIssue: "key1", outwardIssue: "key2" },
  ]);
  expect(map.get("key2")?.relations).toEqual([
    { id: "id", externalId: "id", inwardIssue: "key1", outwardIssue: "key2" },
  ]);
});

test("allow relation to add when inward or outward issue not found in issue", () => {
  const issues: Issue[] = [randomIssue({ key: "key1", relations: [] })];
  let ret = reducer(getInitialState(), synchronizeIssuesFulfilled(issues));
  ret = reducer(
    ret,
    addRelationSucceeded({
      id: "id",
      externalId: "id",
      inwardIssue: "key1",
      outwardIssue: "key2",
    }),
  );

  const map = new Map(ret.issues.map((v) => [v.key, v]));

  expect(map.get("key1")?.relations).toEqual([
    { id: "id", externalId: "id", inwardIssue: "key1", outwardIssue: "key2" },
  ]);
  expect(map.get("key2")).toEqual({
    key: "key2",
    summary: "Unknown issue",
    description: "",
    statusId: "",
    selfUrl: "",
    typeId: "",
    relations: [{ id: "id", externalId: "id", inwardIssue: "key1", outwardIssue: "key2" }],
  });
});

test("update relation when adding relation is successed", () => {
  const issues: Issue[] = [randomIssue({ key: "key1", relations: [] }), randomIssue({ key: "key2", relations: [] })];
  let ret = reducer(getInitialState(), synchronizeIssuesFulfilled(issues));
  ret = reducer(
    ret,
    addRelationSucceeded({
      id: "id",
      externalId: "id",
      inwardIssue: "key1",
      outwardIssue: "key2",
    }),
  );

  const map = new Map(ret.issues.map((v) => [v.key, v]));

  expect(map.get("key1")?.relations).toEqual([
    { id: "id", externalId: "id", inwardIssue: "key1", outwardIssue: "key2" },
  ]);
  expect(map.get("key2")?.relations).toEqual([
    { id: "id", externalId: "id", inwardIssue: "key1", outwardIssue: "key2" },
  ]);
});

test("remove relation if it exists", () => {
  const issues: Issue[] = [randomIssue({ key: "key1", relations: [] }), randomIssue({ key: "key2", relations: [] })];
  let ret = reducer(getInitialState(), synchronizeIssuesFulfilled(issues));
  ret = reducer(
    ret,
    addRelationSucceeded({
      id: "id",
      externalId: "id",
      inwardIssue: "key1",
      outwardIssue: "key2",
    }),
  );
  ret = reducer(ret, removeRelationSucceeded({ relationId: "id" }));

  const map = new Map(ret.issues.map((v) => [v.key, v]));

  expect(map.get("key1")?.relations).toEqual([]);
  expect(map.get("key2")?.relations).toEqual([]);
});
