import test from "ava";
import { synchronizeIssues, synchronizeIssuesFulfilled } from "../actions";
import * as issues from "../slices/issues";
import * as project from "../slices/project";
import * as apiCredential from "../slices/api-credential";
import { RootState } from "../store";
import * as s from "./issues";
import { Loading } from "@/type";
import { Issue } from "@/model/issue";
import { ApiCredential } from "@/model/event";
import { projectFactory } from "@/model/project";

test("do not return issues while loading", (t) => {
  const request = { apiCredential: {} as ApiCredential, searchCondition: { projectKey: "key" } };
  const state = { issues: issues.reducer(issues.getInitialState(), synchronizeIssues(request)) } as RootState;

  const ret = s.queryIssues()(state);

  t.deepEqual(ret, [Loading.Loading, undefined]);
});

test("get issues after fulfilled", (t) => {
  const request = { apiCredential: {} as ApiCredential, searchCondition: { projectKey: "key" } };
  const issue = { key: "key" } as Issue;
  const state = {
    issues: issues.reducer(
      issues.reducer(issues.getInitialState(), synchronizeIssues(request)),
      synchronizeIssuesFulfilled([issue]),
    ),
  } as RootState;

  const ret = s.queryIssues()(state);

  t.deepEqual(ret, [Loading.Completed, [issue]]);
});

test("return undefined if request does not setup", (t) => {
  const state = {
    project: project.getInitialState(),
    apiCredential: apiCredential.getInitialState(),
  } as RootState;

  const ret = s.getIssueRequest()(state);

  t.is(ret, undefined);
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

  const ret = s.getIssueRequest()(state);

  t.deepEqual(ret, {
    apiCredential: credential,
    searchCondition: {
      projectKey: "key",
    },
  });
});
