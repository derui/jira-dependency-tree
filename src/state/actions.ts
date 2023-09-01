import { createAction } from "@reduxjs/toolkit";
import { ApiCredential, SearchCondition } from "@/model/event";
import { Issue, Relation } from "@/model/issue";
import { Suggestion } from "@/model/suggestion";
import { DeltaId, IssueKey, IssueRelationId, SuggestionKind } from "@/type";
import { RelationDelta } from "@/model/relation-delta";

type ApiCredentialPayload = {
  token: string;
  email: string;
  userDomain: string;
};

// actions for api credentail
export const submitApiCredential = createAction<ApiCredentialPayload>("submitApiCredential");
export const submitApiCredentialFulfilled = createAction<ApiCredential>("submitApiCredentialFulfilled");
export const restoreApiCredential = createAction<ApiCredential>("restoreApiCredential");

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

export const selectIssueInGraph = createAction<string>("selectIssueInGraph");
export const deselectIssueInGraph = createAction("deselectIssueInGraph");

// actions for relation edit

// action to import issues
export const importIssues = createAction<{ issues: Issue[] }>("importIssues");

export const relations = {
  reflect: createAction<{ appended: Relation[]; removed: IssueRelationId[] }>("editRelations"),
  prepareToAdd: createAction<DeltaId>("relations:prepareToAdd"),
  appendDelta: createAction<RelationDelta>("relations:appendDelta"),
  deleteDelta: createAction<DeltaId>("relations:deleteDelta"),
  reset: createAction("relations:reset"),
} as const;
