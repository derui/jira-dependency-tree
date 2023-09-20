import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { useMemo } from "react";
import { useAppSelector } from "../_internal-hooks";
import { makeIssueGraph } from "./_graph-calculation";
import { calculateIssueLayout } from "./_issue-layout";
import { calculateLinkLayout } from "./_link-layout";
import { IssueModelWithLayout, LinkLayoutModel } from "@/view-models/graph-layout";
import { RootState } from "@/status/store";
import { issueToIssueModel } from "@/view-models/issue";

type Result = {
  layout: {
    issues: IssueModelWithLayout[];
    links: LinkLayoutModel[];
    selectedIssue: IssueModelWithLayout | undefined;
  };
};

const selectIssues = createDraftSafeSelector(
  (state: RootState) => state,
  (state) =>
    Object.values(state.issues.issues).map((v) => {
      return issueToIssueModel(v);
    }),
);
const selectRelations = createDraftSafeSelector(
  (state: RootState) => state,
  (state) => Object.values(state.relations.relations),
);

const selectCurrentIssueKey = createDraftSafeSelector(
  (state: RootState) => state,
  (state) => state.graphLayout.selectedIssue,
);

/**
 * calculation logic for issue graph layout.
 */
export const useGraphNodeLayout = function useGraphNodeLayout(): Result {
  const issues = useAppSelector(selectIssues);
  const relations = useAppSelector(selectRelations);
  const currentSelectedIssueKey = useAppSelector(selectCurrentIssueKey);

  const state = useMemo(() => {
    const graph = makeIssueGraph(issues, relations);

    const issueLayouts = calculateIssueLayout(graph, issues);
    const links = calculateLinkLayout(relations, issueLayouts);

    return {
      issues: issueLayouts,
      links,
      selectedIssue: currentSelectedIssueKey
        ? issueLayouts.find((v) => v.issue.key === currentSelectedIssueKey)
        : undefined,
    };
  }, [issues, relations, currentSelectedIssueKey]);

  return { layout: state };
};
