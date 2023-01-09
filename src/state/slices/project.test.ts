import test from "ava";
import {
  changeConditionToEpic,
  changeConditionToSprint,
  changeDefaultCondition,
  submitProjectKeyFulfilled,
} from "../actions";
import { getInitialState, reducer } from "./project";
import { projectFactory } from "@/model/project";

test("initial state", (t) => {
  t.deepEqual(getInitialState(), { searchCondition: {} });
});

test("apply project key", (t) => {
  const project = projectFactory({ id: "100", key: "key", name: "name" });
  const ret = reducer(getInitialState(), submitProjectKeyFulfilled(project));

  t.is(ret.project, project);
});

test("can not change search condition if key have not applied", (t) => {
  const ret = reducer(getInitialState(), changeConditionToEpic("epic"));

  t.deepEqual(ret.searchCondition, {});
});

test("use epic", (t) => {
  const project = projectFactory({ id: "100", key: "key", name: "name" });
  const ret = reducer(reducer(getInitialState(), submitProjectKeyFulfilled(project)), changeConditionToEpic("epic"));

  t.deepEqual(ret.searchCondition, { projectKey: "key", epic: "epic" });
});
test("use sprint", (t) => {
  const project = projectFactory({ id: "100", key: "key", name: "name" });
  const ret = reducer(
    reducer(getInitialState(), submitProjectKeyFulfilled(project)),
    changeConditionToSprint({ value: "foo", displayName: "name" }),
  );

  t.deepEqual(ret.searchCondition, { projectKey: "key", sprint: { value: "foo", displayName: "name" } });
});

test("use default condition", (t) => {
  const project = projectFactory({ id: "100", key: "key", name: "name" });
  let ret = reducer(reducer(getInitialState(), submitProjectKeyFulfilled(project)), changeConditionToEpic("epic"));

  ret = reducer(ret, changeDefaultCondition());

  t.deepEqual(ret.searchCondition, { projectKey: "key" });
});
