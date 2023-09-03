import { createAction } from "@reduxjs/toolkit";
import { ApiCredential, SearchCondition } from "@/model/event";
import { Issue, Relation } from "@/model/issue";
import { DeltaId, IssueKey, IssueRelationId } from "@/type";
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

// filter issues
export const filterIssues = createAction<string>("filterIssues");
export const clearIssueFilter = createAction("clearIssueFilter");

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
  filter: createAction<string>("relations:filter"),
  clearFilter: createAction("relations:clearFilter"),
  reflect: createAction<{ appended: Relation[]; removed: IssueRelationId[] }>("reltions:editRelations"),
  prepareToAdd: createAction<DeltaId>("relations:prepareToAdd"),
  appendDelta: createAction<RelationDelta>("relations:appendDelta"),
  deleteDelta: createAction<DeltaId>("relations:deleteDelta"),
  reset: createAction("relations:reset"),
} as const;
