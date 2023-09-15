import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../_internal-hooks";
import { RootState } from "@/status/store";
import { HighlightState, IssueKey } from "@/type";
import { highlightRelatedNodes, resetHighlightRelationNodes } from "@/status/actions";

type Result = {
  enterHover: () => void;
  leaveHover: () => void;

  state: HighlightState;
};

const selectHighlightedIssues = createDraftSafeSelector(
  (state: RootState) => state,
  (state) => {
    const issues = Object.values(state.relations.highlightedRelations).flatMap((v) => [v.inwardIssue, v.outwardIssue]);

    return Array.from(new Set(issues));
  },
);

export const useHighlightIssueNode = function useHightlightIssueNode(key: IssueKey): Result {
  const highlightedIssues = useAppSelector(selectHighlightedIssues);
  const dispatch = useAppDispatch();

  const state = useMemo<HighlightState>(() => {
    if (highlightedIssues.includes(key)) {
      return "highlighted";
    } else if (highlightedIssues.length === 0) {
      return "normal";
    }

    return "obscured";
  }, [highlightedIssues]);

  const enterHover = useCallback<Result["enterHover"]>(() => {
    dispatch(highlightRelatedNodes(key));
  }, []);

  const leaveHover = useCallback<Result["leaveHover"]>(() => {
    dispatch(resetHighlightRelationNodes(key));
  }, []);

  return {
    enterHover,
    leaveHover,
    state,
  };
};
