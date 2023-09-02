import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { useAppDispatch, useAppSelector } from "./_internal-hooks";
import { IssueModel, issueToIssueModel } from "@/view-models/issue";
import { RootState } from "@/state/store";
import { clearIssueFilter, filterIssues } from "@/state/actions";

type UseFilterIssueResult = {
  state: {
    issues: IssueModel[];
  };
  /**
   * filter issues with term
   */
  filter: (term: string) => void;
  /**
   * clear filtering for issues
   */
  clear: () => void;
};

const selectRootState = (state: RootState) => state;
const selectMatchedIssues = createDraftSafeSelector(selectRootState, (state) => {
  return state.issues.matchedIssues.map(issueToIssueModel);
});

/**
 * control filtering issues
 */
export const useFilterIssues = function useFilterIssues(): UseFilterIssueResult {
  const dispatch = useAppDispatch();
  const matchedIssues = useAppSelector(selectMatchedIssues);

  const filter = (term: string) => {
    dispatch(filterIssues(term));
  };

  const clear = () => {
    dispatch(clearIssueFilter());
  };

  return { state: { issues: matchedIssues }, filter, clear };
};
