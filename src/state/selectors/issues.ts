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

export const selectMatchedIssue = () => createDraftSafeSelector(selectIssues, (state) => state.matchedIssues);

export const queryIssueModels = () =>
  createDraftSafeSelector(selectIssues, selectProject, (issueState, projectState) => {
    if (issueState.loading === Loading.Loading || projectState.loading === Loading.Loading) {
      return [Loading.Loading, undefined];
    }

    const project = projectState.project;
    if (!project) {
      return [Loading.Completed, []];
    }

    return [Loading.Completed, issueState.issues.map((issue) => issueToIssueModel(project, issue))];
  });
