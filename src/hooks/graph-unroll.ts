import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "./_internal-hooks";
import { RootState } from "@/status/store";
import { narrowExpandedIssue } from "@/status/actions";

type Result = {
  /**
   * narrow current projection target if it exists. Do not do any action if active is false.
   */
  narrow: () => void;

  active: boolean;
};

const selectProjectionTarget = createDraftSafeSelector(
  (state: RootState) => state,
  (state) => {
    return state.issues.projectionTarget;
  },
);

export const useGraphUnroll = function useGraphUnroll(): Result {
  const dispatch = useAppDispatch();
  const target = useAppSelector(selectProjectionTarget);

  const active = target.kind !== "Root";

  const narrow = useCallback(() => {
    if (active) {
      dispatch(narrowExpandedIssue());
    }
  }, [active]);

  return { narrow, active };
};
