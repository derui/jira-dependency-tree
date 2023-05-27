import { createAction } from "@reduxjs/toolkit";
import { SimpleProject } from "./models/simple-project";
import { ApiCredential, SearchCondition } from "@/model/event";
import { Issue, Relation } from "@/model/issue";
import { Project } from "@/model/project";
import { Suggestion } from "@/model/suggestion";
import { IssueKey, SuggestionKind } from "@/type";

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

export const submitProjectId = createAction<string>("submitProjectId");
export const submitProjectIdFulfilled = createAction<Project>("submitProjectIdFulfilled");
export const submitProjectIdError = createAction("submitProjectIdError");
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
export const attentionIssue = createAction<string>("attentionIssue");
export const attentionIssueFulfilled = createAction("attentionIssueFulfilled");

export const changeZoom = createAction<number>("changeZoom");

export const expandIssue = createAction<IssueKey>("expandIssue");
export const narrowExpandedIssue = createAction("narrowExpandedIssue");

// actions for relation edit
export const selectIssueInGraph = createAction<string>("selectIssueInGraph");
export const deselectIssueInGraph = createAction("deselectIssueInGraph");

export const addRelation = createAction<{ fromKey: string; toKey: string }>("addRelation");
export const addRelationAccepted = createAction<{ relationId: string; fromKey: string; toKey: string }>(
  "addRelationAccepted",
);
export const addRelationSucceeded = createAction<Relation>("addRelationSucceeded");
export const addRelationError = createAction<{ relationId: string; fromKey: string; toKey: string }>(
  "addRelationError",
);

export const removeRelation = createAction<{ fromKey: string; toKey: string }>("removeRelation");
export const removeRelationSucceeded = createAction<{ relationId: string }>("removeRelationSucceeded");
export const removeRelationError = createAction<{ fromKey: string; toKey: string }>("removeRelationError");

/**
 * Actions for projects
 */
export const projects = {
  loadProjects: createAction("projects:loadProjects"),
  loadProjectsSucceeded: createAction<{ projects: SimpleProject[] }>("projects:loadProjectsSucceeded"),
  loadProjectsError: createAction<{ reason: string }>("projects:loadProjectsError"),
} as const;
