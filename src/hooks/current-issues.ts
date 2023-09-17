import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { useAppSelector } from "./_internal-hooks";
import { IssueModel, issueToIssueModel } from "@/view-models/issue";
import { RootState } from "@/status/store";

type Result = {
  readonly issues: ReadonlyArray<IssueModel>;
};

const selectRootState = (state: RootState) => state;
const selectMatchedIssues = createDraftSafeSelector(selectRootState, (state) => {
  return Object.values(state.issues.issues).map(issueToIssueModel);
});

/**
 * get current issues. Issues returned from this hook is not filtered by other hook.
 */
export const useCurrentIssues = function useCurrentIssues(): Result {
  const issues = useAppSelector(selectMatchedIssues);

  return { issues };
};
