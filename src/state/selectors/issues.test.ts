import test from "ava";
import { synchronizeIssues, synchronizeIssuesFulfilled } from "../actions";
import { getInitialState, reducer } from "../slices/issues";
import { RootState } from "../store";
import * as s from "./issues";
import { Loading } from "@/type";
import { Issue } from "@/model/issue";
import { ApiCredential } from "@/model/event";

test("do not return issues while loading", (t) => {
  const request = { apiCredential: {} as ApiCredential, searchCondition: { projectKey: "key" } };
  const state = { issues: reducer(getInitialState(), synchronizeIssues(request)) } as RootState;

  const ret = s.queryIssues()(state);

  t.deepEqual(ret, [Loading.Loading, undefined]);
});

test("get issues after fulfilled", (t) => {
  const request = { apiCredential: {} as ApiCredential, searchCondition: { projectKey: "key" } };
  const issue = { key: "key" } as Issue;
  const state = {
    issues: reducer(reducer(getInitialState(), synchronizeIssues(request)), synchronizeIssuesFulfilled([issue])),
  } as RootState;

  const ret = s.queryIssues()(state);

  t.deepEqual(ret, [Loading.Completed, [issue]]);
});
