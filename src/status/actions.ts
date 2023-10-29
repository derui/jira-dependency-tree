import { createAction } from "@reduxjs/toolkit";
import { ApiCredential } from "@/models/event";
import { Issue, Relation } from "@/models/issue";
import { DeltaId, IssueRelationId } from "@/type";
import { RelationDelta } from "@/models/relation-delta";

// actions for api credentail
export const submitApiCredential = createAction<ApiCredential>("submitApiCredential");
export const restoreApiCredential = createAction<ApiCredential>("restoreApiCredential");

// filter issues
export const filterIssues = createAction<string>("filterIssues");
export const clearIssueFilter = createAction("clearIssueFilter");

// actions for issue graph
export const payAttentionIssue = createAction<string>("payAttentionIssue");

export const changeZoom = createAction<number>("changeZoom");

export const selectIssueInGraph = createAction<string>("selectIssueInGraph");
export const deselectIssueInGraph = createAction<string>("deselectIssueInGraph");
export const removeNode = createAction<string>("removeNode");

// highlight issues/link
export const highlightRelatedNodes = createAction<string>("highlightRelationNodes");
export const resetHighlightRelationNodes = createAction<string>("resetHighlightRelationNodes");

// action to import issues
export const importIssues = createAction<{ issues: Issue[] }>("importIssues");

// actions for relation edit
export const relations = {
  filter: createAction<string>("relations:filter"),
  clearFilter: createAction("relations:clearFilter"),
  reflect: createAction<{ appended: Relation[]; removed: IssueRelationId[] }>("reltions:editRelations"),
  appendDelta: createAction<RelationDelta>("relations:appendDelta"),
  deleteDelta: createAction<DeltaId>("relations:deleteDelta"),
  reset: createAction("relations:reset"),
} as const;

// actions for issue set
export const issueSet = {
  create: createAction<string>("issueSet:create"),
  delete: createAction<string>("issueSet:delete"),
  rename: createAction<{ from: string; to: string }>("issueSet:rename"),
  select: createAction<string>("issueSet:select"),
} as const;

// actions to manage loading state
export const loading = {
  startImport: createAction("loading:startImport"),
  finishImport: createAction("loading:finishImport"),
  errorImport: createAction<string>("loading:errorImport"),
} as const;
