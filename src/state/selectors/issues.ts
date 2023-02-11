import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { Loading } from "@/type";
import { issueToIssueModel } from "@/view-models/issue";

const selectSelf = (state: RootState) => state;
const selectIssues = createDraftSafeSelector(selectSelf, (state) => state.issues);
const selectProject = createDraftSafeSelector(selectSelf, (state) => state.project);

export const queryIssues = () =>
  createDraftSafeSelector(
    selectIssues,
    (state) => [state.loading, state.loading === Loading.Loading ? undefined : state.issues] as const,
  );

export const isSyncable = () =>
  createDraftSafeSelector(selectSelf, (state) =>
    state.apiCredential.credential && state.project.project && state.issues.loading !== Loading.Loading ? true : false,
  );

const selectMatchedIssue = () => createDraftSafeSelector(selectIssues, (state) => state.matchedIssues);

export const selectMatchedIssueModel = () =>
  createDraftSafeSelector(selectMatchedIssue(), selectProject, (issues, projectState) => {
    if (projectState.loading === Loading.Loading) {
      return [];
    }

    const project = projectState.project;
    if (!project) {
      return [];
    }

    return issues.map((issue) => issueToIssueModel(project, issue));
  });

export const selectProjectionTargetIssue = () =>
  createDraftSafeSelector(selectIssues, (state) => {
    switch (state.projectionTarget.kind) {
      case "InsideIssue":
        const issueKey = state.projectionTarget.issueKey;
        return state._originalIssues.find((issue) => issue.key === issueKey);
      case "Root":
        return undefined;
    }
  });
