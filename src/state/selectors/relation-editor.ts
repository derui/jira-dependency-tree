import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { Loading } from "@/type";
import { IssueModel, issueToIssueModel } from "@/view-models/issue";

const selectSelf = (state: RootState) => state;
const selectIssue = createDraftSafeSelector(selectSelf, (state) => state.issues);
const selectProject = createDraftSafeSelector(selectSelf, (state) => state.project);
const selectRelationEditor = createDraftSafeSelector(selectSelf, (state) => state.relationEditor);

export type RelationKind = "inward" | "outward";

export const queryCurrentRelatedIssuesWithKind = (kind: RelationKind) =>
  createDraftSafeSelector(
    selectIssue,
    selectProject,
    selectRelationEditor,
    (issueState, projectState, relationEditorState): [Loading, IssueModel[] | undefined] => {
      if (issueState.loading === Loading.Loading || projectState.loading === Loading.Loading) {
        return [Loading.Loading, undefined];
      }

      const project = projectState.project;
      if (!project) {
        return [Loading.Completed, []];
      }

      const selectedIssueKey = relationEditorState.selectedIssueKey;
      if (!selectedIssueKey) {
        return [Loading.Completed, []];
      }

      const issues = Object.fromEntries(issueState.issues.map((issue) => [issue.key, issue]));
      const relations = relationEditorState.relations[selectedIssueKey] ?? {};

      let relatedIssues = [];

      switch (kind) {
        case "inward":
          relatedIssues = Object.values(relations)
            .filter((r) => r.outwardIssue === selectedIssueKey)
            .map((r) => r.inwardIssue);
          break;
        case "outward":
          relatedIssues = Object.values(relations)
            .filter((r) => r.inwardIssue === selectedIssueKey)
            .map((r) => r.outwardIssue);
          break;
      }

      const issueModels = relatedIssues.map((issueKey) => {
        const issue = issues[issueKey];
        if (!issue) {
          return { key: issueKey, summary: "Unknown issue" };
        }

        return issueToIssueModel(project, issue);
      });

      return [Loading.Completed, issueModels];
    },
  );
