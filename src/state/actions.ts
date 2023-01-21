import { createAction } from "@reduxjs/toolkit";
import { ApiCredential, SearchCondition } from "@/model/event";
import { Issue, Relation } from "@/model/issue";
import { Project } from "@/model/project";
import { Suggestion } from "@/model/suggestion";
import { SuggestionKind } from "@/type";

type ApiCredentialPayload = {
  token: string;
  email: string;
  userDomain: string;
};

// actions for api credentail
export const submitApiCredential = createAction<ApiCredentialPayload>("submitApiCredential");
export const submitApiCredentialFulfilled = createAction<ApiCredential>("submitApiCredentialFulfilled");
export const restoreApiCredential = createAction<ApiCredential>("restoreApiCredential");

// actions for project

export const submitProjectKey = createAction<string>("submitProjectKey");
export const submitProjectKeyFulfilled = createAction<Project>("submitProjectKeyFulfilled");
export const submitProjectKeyError = createAction("submitProjectKeyError");
export const changeConditionToEpic = createAction<string>("changeConditionToEpic");
export const changeConditionToSprint = createAction<{ value: string; displayName: string }>("changeConditionToSprint");
export const changeDefaultCondition = createAction("changeDefaultCondition");

export const changeSearchConditionFullfilled = createAction<Issue[]>("changeSearchConditionFullfilled");

// actions for issue
export type IssueRequest = {
  apiCredential: ApiCredential;
  searchCondition: SearchCondition;
};

export const synchronizeIssues = createAction("synchronizeIssues");
export const synchronizeIssuesFulfilled = createAction<Issue[]>("synchronizeIssuesFulfilled");

export const searchIssue = createAction<string>("searchIssue");

// actions for graph layout
export const changeToVerticalLayout = createAction("changeToVerticalLayout");
export const changeToHorizontalLayout = createAction("changeToHorizontalLayout");

// actions for suggestion
export const requestSuggestion = createAction<{ term: string; kind: SuggestionKind }>("requestSuggestion");
export const requestSuggestionAccepted = createAction<{ term: string; kind: SuggestionKind }>(
  "requestSuggestionAccepted",
);
export const requestSuggestionFulfilled = createAction<{ kind: SuggestionKind; suggestion: Suggestion }>(
  "requestSuggestionFulfilled",
);
export const requestSuggestionError = createAction<string>("requestSuggestionError");

// actions for issue graph
export const focusIssueOnSearch = createAction<string>("focusIssueOnSearch");
export const focusIssueOnSearchFulfilled = createAction("focusIssueOnSearchFulfilled");

export const changeZoom = createAction<number>("changeZoom");

// actions for relation edit
export const selectIssueInGraph = createAction<string>("selectIssueInGraph");
export const deselectIssueInGraph = createAction("deselectIssueInGraph");

export const addRelation = createAction<{ fromKey: string; toKey: string }>("addRelation");
export const addRelationAccepted = createAction<{ relationId: string; fromKey: string; toKey: string }>(
  "addRelationAccepted",
);
export const addRelationSucceeded = createAction<Relation>("addRelationSucceeded");
export const addRelationError = createAction<{ relationId: string }>("addRelationError");

export const removeRelation = createAction<{ relationId: string }>("removeRelation");
export const removeRelationSucceeded = createAction<{ relationId: string }>("removeRelationSucceeded");
export const removeRelationError = createAction<{ relationId: string }>("removeRelationError");
