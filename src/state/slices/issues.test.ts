import { test, expect } from "vitest";
import {
  addRelationSucceeded,
  expandIssue,
  narrowExpandedIssue,
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
  expect(getInitialState()).toEqual({
    issues: [],
    loading: Loading.Completed,
    matchedIssues: [],
    _originalIssues: [],
    projectionTarget: { kind: "Root" },
  });
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

test("loaded issues with other projection target", () => {
  const issue = {
    key: "key",
    summary: "summary",
    description: "description",
    statusId: "",
    typeId: "",
    selfUrl: "",
    relations: [],
    parentIssue: "key2",
  };
  const issue2 = {
    key: "key2",
    summary: "summary",
    description: "description",
    statusId: "",
    typeId: "",
    selfUrl: "",
    relations: [],
  };
  let ret = reducer(getInitialState(), expandIssue("key2"));
  ret = reducer(ret, synchronizeIssuesFulfilled([issue, issue2]));

  expect(ret.issues).toHaveLength(1);
  expect(ret.issues).toEqual(expect.arrayContaining([issue]));
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

test("projection target is parent issue", () => {
  const issues: Issue[] = [
    randomIssue({ key: "key1", parentIssue: "key3" }),
    randomIssue({ key: "key2" }),
    randomIssue({ key: "key3" }),
  ];
  let ret = reducer(getInitialState(), synchronizeIssuesFulfilled(issues));
  ret = reducer(ret, expandIssue("key3"));

  expect(ret.issues).toEqual(expect.arrayContaining([issues[0]]));
  expect(ret.issues).toHaveLength(1);
});

test("restore projection target", () => {
  const issues: Issue[] = [
    randomIssue({ key: "key1", parentIssue: "key3" }),
    randomIssue({ key: "key2" }),
    randomIssue({ key: "key3" }),
  ];
  let ret = reducer(getInitialState(), synchronizeIssuesFulfilled(issues));
  ret = reducer(ret, expandIssue("key3"));
  ret = reducer(ret, narrowExpandedIssue());

  expect(ret.issues).toEqual(expect.arrayContaining(issues));
  expect(ret.issues).toHaveLength(3);
});
