import { test, expect } from "vitest";
import type { RootState } from "../store";
import * as s from "./project";
import { Loading } from "@/type";
import { projectFactory } from "@/model/project";

test("return project if state of loading is not loading", () => {
  const state = {
    project: {
      project: projectFactory({ key: "key", id: "id", name: "name" }),
      searchCondition: {},
      loading: Loading.Completed,
    },
  } as RootState;

  const ret = s.queryProject()(state);

  expect(ret).toEqual([Loading.Completed, state.project.project]);
});

test("do not return project in loading", () => {
  const state = {
    project: {
      project: projectFactory({ key: "key", id: "id", name: "name" }),
      searchCondition: {},
      loading: Loading.Loading,
    },
  } as RootState;

  const ret = s.queryProject()(state);

  expect(ret).toEqual([Loading.Loading, undefined]);
});

test("return false if setup is not finished yet", () => {
  const credential = {
    apiBaseUrl: "api",
    apiKey: "key",
    email: "test@example.com",
    token: "token",
    userDomain: "domain",
  };
  const state = {
    project: {
      searchCondition: {
        projectKey: "key",
      },
    },
    apiCredential: {
      credential: credential,
    },
  } as RootState;

  const ret = s.isSearchConditionEditable()(state);

  expect(ret).toBeFalsy();
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
  } as RootState;

  const ret = s.isSearchConditionEditable()(state);

  expect(ret).toBeTruthy();
});
