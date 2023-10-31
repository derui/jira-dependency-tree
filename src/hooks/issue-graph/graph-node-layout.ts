import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { useMemo } from "react";
import deepEqual from "fast-deep-equal";
import { useAppSelector } from "../_internal-hooks";
import { selectCurrentAndLoadingIssues } from "../_selectors/current-issues";
import { makeIssueGraph } from "./_graph-calculation";
import { calculateIssueLayout } from "./_issue-layout";
import { calculateLinkLayout } from "./_link-layout";
import { IssueModelWithLayout, LinkLayoutModel } from "@/view-models/graph-layout";
import { RootState } from "@/status/store";

type Result = {
  layout: {
    issues: IssueModelWithLayout[];
    links: LinkLayoutModel[];
    selectedIssue: IssueModelWithLayout | undefined;
  };
};

const selectRootState = (state: RootState) => state;

const selectRelations = createDraftSafeSelector(selectRootState, (state) => {
  return state.relations.relations;
});

const selectRelationValues = createDraftSafeSelector(selectRelations, (state) => Object.values(state));

const selectCurrentIssueKey = createDraftSafeSelector(
  (state: RootState) => state,
  (state) => state.graphLayout.selectedIssue,
);

/**
 * calculation logic for issue graph layout.
 */
export const useGraphNodeLayout = function useGraphNodeLayout(): Result {
  const issues = useAppSelector(selectCurrentAndLoadingIssues, deepEqual);
  const relations = useAppSelector(selectRelationValues, deepEqual);
  const currentSelectedIssueKey = useAppSelector(selectCurrentIssueKey);

  const graphState = useMemo(() => {
    const graph = makeIssueGraph(issues, relations);

    const issueLayouts = calculateIssueLayout(graph, issues);
    const links = calculateLinkLayout(relations, issueLayouts);

    return {
      issues: issueLayouts,
      links,
    };
  }, [issues, relations]);

  const selectedIssue = useMemo(() => {
    return currentSelectedIssueKey ? graphState.issues.find((v) => v.issue.key === currentSelectedIssueKey) : undefined;
  }, [graphState, currentSelectedIssueKey]);

  return { layout: { ...graphState, selectedIssue: selectedIssue } };
};
