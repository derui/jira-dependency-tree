import deepEqual from "fast-deep-equal";
import { useAppSelector } from "./_internal-hooks";
import { selectCurrentIssues } from "./_selectors/current-issues";
import { IssueModel } from "@/view-models/issue";

type Result = {
  readonly issues: ReadonlyArray<IssueModel>;
};

/**
 * get current issues. Issues returned from this hook is not filtered by other hook.
 */
export const useCurrentIssues = function useCurrentIssues(): Result {
  const issues = useAppSelector(selectCurrentIssues, { equalityFn: deepEqual });

  return { issues };
};
