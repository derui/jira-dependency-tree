import { createAction } from "@reduxjs/toolkit";
import { ApiCredential } from "@/models/event";
import { Issue, Relation } from "@/models/issue";
import { DeltaId, GraphLayout, IssueKey, IssueRelationId } from "@/type";
import { RelationDelta } from "@/models/relation-delta";

// actions for api credentail
export const submitApiCredential = createAction<ApiCredential>("submitApiCredential");
export const restoreApiCredential = createAction<ApiCredential>("restoreApiCredential");

// filter issues
export const filterIssues = createAction<string>("filterIssues");
export const clearIssueFilter = createAction("clearIssueFilter");

// graph layout (internal use)
export const changeGraphLayout = createAction<GraphLayout>("changeGraphLayout:internal");

// actions for issue graph
export const payAttentionIssue = createAction<string>("payAttentionIssue");

export const changeZoom = createAction<number>("changeZoom");

export const expandIssue = createAction<IssueKey>("expandIssue");
export const narrowExpandedIssue = createAction("narrowExpandedIssue");

export const selectIssueInGraph = createAction<string>("selectIssueInGraph");

// action to import issues
export const importIssues = createAction<{ issues: Issue[] }>("importIssues");

// actions for relation edit
export const relations = {
  filter: createAction<string>("relations:filter"),
  clearFilter: createAction("relations:clearFilter"),
  reflect: createAction<{ appended: Relation[]; removed: IssueRelationId[] }>("reltions:editRelations"),
  prepareToAdd: createAction<DeltaId>("relations:prepareToAdd"),
  appendDelta: createAction<RelationDelta>("relations:appendDelta"),
  deleteDelta: createAction<DeltaId>("relations:deleteDelta"),
  reset: createAction("relations:reset"),
} as const;
