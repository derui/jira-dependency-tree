import { createAction } from "@reduxjs/toolkit";
import { ApiCredential, SearchCondition } from "@/model/event";
import { Issue } from "@/model/issue";

type ApiCredentialPayload = {
  jiraToken: string;
  email: string;
  userDomain: string;
};

// actions for api credentail
export const submitApiCredential = createAction<ApiCredentialPayload>("submitApiCredential");
export const submitApiCredentialFulfilled = createAction<ApiCredential>("submitApiCredentialFulfilled");
export const restoreApiCredential = createAction<ApiCredential>("restoreApiCredential");

// actions for project

export const submitProjectKey = createAction<string>("submitProjectKey");
export const submitProjectKeyFulfilled = createAction<string>("submitProjectKeyFulfilled");
export const changeConditionToEpic = createAction<string>("changeConditionToEpic");
export const changeConditionToSprint = createAction<{ value: string; displayName: string }>("changeConditionToSprint");
export const changeDefaultCondition = createAction("changeDefaultCondition");

export const changeSearchConditionFullfilled = createAction<Issue[]>("changeSearchConditionFullfilled");
