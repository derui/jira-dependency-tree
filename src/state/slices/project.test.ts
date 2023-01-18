import { test, expect } from "vitest";
import {
  changeConditionToEpic,
  changeConditionToSprint,
  changeDefaultCondition,
  submitProjectKey,
  submitProjectKeyFulfilled,
} from "../actions";
import { getInitialState, reducer } from "./project";
import { projectFactory } from "@/model/project";
import { Loading } from "@/type";

test("initial state", () => {
  expect(getInitialState()).toEqual({ searchCondition: {}, loading: Loading.Completed });
});

test("apply project key", () => {
  const project = projectFactory({ id: "100", key: "key", name: "name" });
  const ret = reducer(getInitialState(), submitProjectKeyFulfilled(project));

  expect(ret.project).toBe(project);
});

test("loading", () => {
  const ret = reducer(getInitialState(), submitProjectKey("key"));

  expect(ret.loading).toBe(Loading.Loading);
});

test("can not change search condition if key have not applied", () => {
  const ret = reducer(getInitialState(), changeConditionToEpic("epic"));

  expect(ret.searchCondition).toEqual({});
});

test("use epic", () => {
  const project = projectFactory({ id: "100", key: "key", name: "name" });
  const ret = reducer(reducer(getInitialState(), submitProjectKeyFulfilled(project)), changeConditionToEpic("epic"));

  expect(ret.searchCondition).toEqual({ projectKey: "key", epic: "epic" });
});
test("use sprint", () => {
  const project = projectFactory({ id: "100", key: "key", name: "name" });
  const ret = reducer(
    reducer(getInitialState(), submitProjectKeyFulfilled(project)),
    changeConditionToSprint({ value: "foo", displayName: "name" }),
  );

  expect(ret.searchCondition).toEqual({ projectKey: "key", sprint: { value: "foo", displayName: "name" } });
});

test("use default condition", () => {
  const project = projectFactory({ id: "100", key: "key", name: "name" });
  let ret = reducer(reducer(getInitialState(), submitProjectKeyFulfilled(project)), changeConditionToEpic("epic"));

  ret = reducer(ret, changeDefaultCondition());

  expect(ret.searchCondition).toEqual({ projectKey: "key" });
});
