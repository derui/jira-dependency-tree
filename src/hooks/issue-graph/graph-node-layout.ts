import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { useMemo } from "react";
import deepEqual from "fast-deep-equal";
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
  (state) => {
    return state.relations.relations;
  },
);

const selectRelationValues = createDraftSafeSelector(selectRelations, (state) => Object.values(state));

const selectCurrentIssueKey = createDraftSafeSelector(
  (state: RootState) => state,
  (state) => state.graphLayout.selectedIssue,
);

/**
 * calculation logic for issue graph layout.
 */
export const useGraphNodeLayout = function useGraphNodeLayout(): Result {
  const issues = useAppSelector(selectIssues, deepEqual);
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
