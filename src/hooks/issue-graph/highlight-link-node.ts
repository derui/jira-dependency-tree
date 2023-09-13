import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { useMemo } from "react";
import { useAppSelector } from "../_internal-hooks";
import { RootState } from "@/status/store";
import { IssueRelationId } from "@/type";

type HighlightState = "normal" | "highlighted" | "obscured";

const selectHighlightedRelations = createDraftSafeSelector(
  (state: RootState) => state,
  (state) => {
    return Object.keys(state.relations.highlightedRelations);
  },
);

export const useHighlightLinkNode = function useHighlightLinkNode(id: IssueRelationId): HighlightState {
  const highlightedRelations = useAppSelector(selectHighlightedRelations);

  const state = useMemo<HighlightState>(() => {
    if (highlightedRelations.includes(id)) {
      return "highlighted";
    } else if (highlightedRelations.length === 0) {
      return "normal";
    }

    return "obscured";
  }, [highlightedRelations]);

  return state;
};
