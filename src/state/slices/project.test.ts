import test from "ava";
import {
  changeConditionToEpic,
  changeConditionToSprint,
  changeDefaultCondition,
  submitProjectKeyFulfilled,
  submitSearchCondition,
} from "../actions";
import { getInitialState, reducer } from "./project";

test("initial state", (t) => {
  t.deepEqual(getInitialState(), { searchCondition: {} });
});

test("apply project key", (t) => {
  const ret = reducer(getInitialState(), submitProjectKeyFulfilled("key"));

  t.is(ret.key, "key");
});

test("can not change search condition if key have not applied", (t) => {
  const ret = reducer(getInitialState(), changeConditionToEpic("epic"));

  t.deepEqual(ret.searchCondition, {});
});

test("use epic", (t) => {
  const ret = reducer(reducer(getInitialState(), submitProjectKeyFulfilled("key")), changeConditionToEpic("epic"));

  t.deepEqual(ret.searchCondition, { projectKey: "key", epic: "epic" });
});
test("use sprint", (t) => {
  const ret = reducer(
    reducer(getInitialState(), submitProjectKeyFulfilled("key")),
    changeConditionToSprint({ value: "foo", displayName: "name" }),
  );

  t.deepEqual(ret.searchCondition, { projectKey: "key", sprint: { value: "foo", displayName: "name" } });
});

test("use default condition", (t) => {
  let ret = reducer(reducer(getInitialState(), submitProjectKeyFulfilled("key")), changeConditionToEpic("epic"));

  ret = reducer(ret, changeDefaultCondition());

  t.deepEqual(ret.searchCondition, { projectKey: "key" });
});
