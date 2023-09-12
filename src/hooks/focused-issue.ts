import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { useAppSelector } from "./_internal-hooks";
import type { RootState } from "@/status/store";

const selector = createDraftSafeSelector(
  (state: RootState) => state,
  (state) => state.attentionIssue.focusedIssueKey,
);

/**
 * the hook to get api credential currently enabled
 */
export const useFocusedIssue = function useFocusedIssue() {
  const focusedIssue = useAppSelector(selector);

  return focusedIssue;
};
