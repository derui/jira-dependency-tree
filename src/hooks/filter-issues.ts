import { useMemo, useState } from "react";
import deepEqual from "fast-deep-equal";
import { useAppSelector } from "./_internal-hooks";
import { selectCurrentIssues } from "./_selectors/current-issues";
import { IssueModel, isLoadedIssueModel } from "@/view-models/issue";

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

/**
 * control filtering issues
 */
export const useFilterIssues = function useFilterIssues(): UseFilterIssueResult {
  const currentIssues = useAppSelector(selectCurrentIssues, { equalityFn: deepEqual });
  const [term, setTerm] = useState("");

  const matchedIssues = useMemo(() => {
    const revisedTerm = term.toLowerCase();

    return currentIssues.filter(isLoadedIssueModel).filter((v) => {
      return v.key.toLowerCase().includes(revisedTerm) || v.summary.toLowerCase().includes(revisedTerm);
    });
  }, [term, currentIssues]);

  const filter = (term: string) => {
    setTerm(term);
  };

  const clear = () => {
    setTerm("");
  };

  return { state: { issues: matchedIssues }, filter, clear };
};
