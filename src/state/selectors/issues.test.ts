import { test, expect, describe } from "vitest";
import {
  expandIssue,
  searchIssue,
  submitProjectId,
  submitProjectIdFulfilled,
  synchronizeIssues,
  synchronizeIssuesFulfilled,
} from "../actions";
import * as issues from "../slices/issues";
import * as project from "../slices/project";
import * as apiCredential from "../slices/api-credential";
import { createPureStore, RootState } from "../store";
import * as s from "./issues";
import { Loading } from "@/type";
import { Issue } from "@/model/issue";
import { projectFactory } from "@/model/project";
import { randomIssue, randomProject } from "@/mock-data";

test("do not return issues while loading", () => {
  const state = { issues: issues.reducer(issues.getInitialState(), synchronizeIssues()) } as RootState;

  const ret = s.queryIssues()(state);

  expect(ret).toEqual([Loading.Loading, undefined]);
});

test("get issues after fulfilled", () => {
  const issue = { key: "key" } as Issue;
  const state = {
    issues: issues.reducer(
      issues.reducer(issues.getInitialState(), synchronizeIssues()),
      synchronizeIssuesFulfilled([issue]),
    ),
  } as RootState;

  const ret = s.queryIssues()(state);

  expect(ret).toEqual([Loading.Completed, [issue]]);
});

test("does not syncable if setup did not finished", () => {
  const state = {
    project: project.getInitialState(),
    apiCredential: apiCredential.getInitialState(),
    issues: issues.getInitialState(),
  } as RootState;

  const ret = s.isSyncable()(state);

  expect(ret).toBe(false);
});

test("return request if request setup finished", () => {
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
    issues: issues.getInitialState(),
  } as RootState;

  const ret = s.isSyncable()(state);

  expect(ret).toBe(true);
});

describe("queryIssueModels", () => {
  test("loading when project or issue are loading", () => {
    const store = createPureStore();
    store.dispatch(submitProjectId("key"));

    const ret = s.selectMatchedIssueModel()(store.getState());

    expect(ret).toEqual([]);
  });

  test("can not get issues when project is invalid", () => {
    const store = createPureStore();
    store.dispatch(synchronizeIssuesFulfilled([randomIssue()]));

    const ret = s.selectMatchedIssueModel()(store.getState());

    expect(ret).toEqual([]);
  });

  test("get issue model", () => {
    const issues = [randomIssue({ summary: "sum", statusId: "", typeId: "" })];
    const store = createPureStore();

    store.dispatch(synchronizeIssuesFulfilled(issues));
    store.dispatch(submitProjectIdFulfilled(randomProject()));
    store.dispatch(searchIssue("sum"));

    const ret = s.selectMatchedIssueModel()(store.getState());

    expect(ret).toEqual([{ key: issues[0].key, summary: issues[0].summary }]);
  });
});

describe("select issue that is current projection target", () => {
  test("return undefined when no projection target", () => {
    const store = createPureStore();
    store.dispatch(synchronizeIssuesFulfilled([randomIssue({ key: "key" })]));

    const ret = s.selectProjectionTargetIssue()(store.getState());

    expect(ret).toBeUndefined();
  });

  test("return issue target projected", () => {
    const issues = [randomIssue({ key: "key" })];
    const store = createPureStore();

    store.dispatch(synchronizeIssuesFulfilled(issues));
    store.dispatch(expandIssue("key"));

    const ret = s.selectProjectionTargetIssue()(store.getState());

    expect(ret).toEqual(issues[0]);
  });
});
