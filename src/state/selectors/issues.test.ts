import test from "ava";
import { synchronizeIssues, synchronizeIssuesFulfilled } from "../actions";
import * as issues from "../slices/issues";
import * as project from "../slices/project";
import * as apiCredential from "../slices/api-credential";
import { RootState } from "../store";
import * as s from "./issues";
import { Loading } from "@/type";
import { Issue } from "@/model/issue";
import { projectFactory } from "@/model/project";

test("do not return issues while loading", (t) => {
  const state = { issues: issues.reducer(issues.getInitialState(), synchronizeIssues()) } as RootState;

  const ret = s.queryIssues()(state);

  t.deepEqual(ret, [Loading.Loading, undefined]);
});

test("get issues after fulfilled", (t) => {
  const issue = { key: "key" } as Issue;
  const state = {
    issues: issues.reducer(
      issues.reducer(issues.getInitialState(), synchronizeIssues()),
      synchronizeIssuesFulfilled([issue]),
    ),
  } as RootState;

  const ret = s.queryIssues()(state);

  t.deepEqual(ret, [Loading.Completed, [issue]]);
});

test("does not syncable if setup did not finished", (t) => {
  const state = {
    project: project.getInitialState(),
    apiCredential: apiCredential.getInitialState(),
  } as RootState;

  const ret = s.isSyncable()(state);

  t.is(ret, false);
});

test("return request if request setup finished", (t) => {
  const credential = {
    apiBaseUrl: "api",
    apiKey: "key",
    email: "test@example.com",
    token: "token",
    userDomain: "domain",
  };
  const state = {
    project: {
      project: projectFactory({ id: "id", key: "key", name: "name" }),
      searchCondition: {
        projectKey: "key",
      },
    },
    apiCredential: {
      credential: credential,
    },
  } as RootState;

  const ret = s.isSyncable()(state);

  t.is(ret, true);
});
