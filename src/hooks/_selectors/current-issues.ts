import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { RootState } from "@/status/store";
import { issueToIssueModel, makeLoadingIssue } from "@/view-models/issue";

const selectRootState = (state: RootState) => state;

const selectIssuesState = createDraftSafeSelector(selectRootState, (state) => {
  return state.issues;
});

/**
 * return current loaded issues as model
 */
export const selectCurrentIsues = createDraftSafeSelector(selectIssuesState, (issues) => {
  return Object.values(issues.issues).map((v) => {
    return issueToIssueModel(v);
  });
});

const selectLoadingState = createDraftSafeSelector(selectRootState, (state) => {
  return state.loading.issues;
});

export const selectCurrentAndLoadingIssues = createDraftSafeSelector(
  selectLoadingState,
  selectCurrentIsues,
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
