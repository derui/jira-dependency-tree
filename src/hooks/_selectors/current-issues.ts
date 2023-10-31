import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { RootState } from "@/status/store";
import { IssueModel, issueToIssueModel, makeLoadingIssue } from "@/view-models/issue";
import { IssueKey } from "@/type";

const selectRootState = (state: RootState) => state;

const selectIssuesState = createDraftSafeSelector(selectRootState, (state) => {
  return state.issues;
});

/**
 * return current loaded issues as model
 */
export const selectCurrentIssueRecord = createDraftSafeSelector(selectIssuesState, (issues) => {
  const ret: Record<IssueKey, IssueModel> = {};
  for (const [key, issue] of Object.entries(issues.issues)) {
    ret[key] = issueToIssueModel(issue);
  }

  return ret;
});

/**
 * return current loaded issues as model
 */
export const selectCurrentIssues = createDraftSafeSelector(selectCurrentIssueRecord, (issues) => {
  return Object.values(issues);
});

const selectLoadingState = createDraftSafeSelector(selectRootState, (state) => {
  return state.loading.issues;
});

export const selectCurrentAndLoadingIssues = createDraftSafeSelector(
  selectLoadingState,
  selectCurrentIssues,
  (loading, issues) => {
    const loadingIssues = Object.entries(loading)
      .filter(([_, b]) => b)
      .map(([v, _]) => {
        return makeLoadingIssue(v);
      });

    console.log(issues.concat(...loadingIssues));
    return issues.concat(...loadingIssues);
  },
);
