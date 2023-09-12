import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../_internal-hooks";
import { makeIssueGraph } from "./_graph-calculation";
import { calculateIssueLayout } from "./_issue-layout";
import { calculateLinkLayout } from "./_link-layout";
import { IssueModelWithLayout, LinkLayoutModel } from "@/view-models/graph-layout";
import { RootState } from "@/status/store";
import { issueToIssueModel } from "@/view-models/issue";
import { IssueKey } from "@/type";
import { selectIssueInGraph } from "@/status/actions";

type Result = {
  /**
   * select issue in layout
   */
  select: (key: IssueKey) => void;

  layout: {
    issues: IssueModelWithLayout[];
    links: LinkLayoutModel[];
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

/**
 * calculation logic for issue graph layout.
 */
export const useGraphNodeLayout = function useGraphNodeLayout(): Result {
  const dispatch = useAppDispatch();
  const issues = useAppSelector(selectIssues);
  const relations = useAppSelector(selectRelations);

  const state = useMemo(() => {
    const graph = makeIssueGraph(issues, relations);

    const issueLayouts = calculateIssueLayout(graph, issues);
    const links = calculateLinkLayout(relations, issueLayouts);

    return {
      issues: issueLayouts,
      links,
    };
  }, [issues, relations]);

  const select = (key: IssueKey) => {
    dispatch(selectIssueInGraph(key));
  };

  return { layout: state, select };
};
