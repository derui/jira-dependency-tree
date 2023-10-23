import { useCallback, useState } from "react";
import { createDraftSafeSelector } from "@reduxjs/toolkit";
import deepEqual from "fast-deep-equal";
import { useAppSelector } from "./_internal-hooks";
import { useGetApiCredential } from "./get-api-credential";
import { useImportIssues } from "./_import-issues";
import { RootState } from "@/status/store";

interface Hook {
  /**
   * synchronize issues and relations
   */
  sync: () => void;

  /**
   * synchronizing or not
   */
  isLoading: boolean;

  /**
   * set error if synchronizing is failed
   */
  error?: string;

  /**
   * return synchronize enabled
   */
  isEnabled: boolean;
}

const rootState = (state: RootState) => state;

const currentIssueKeys = createDraftSafeSelector(
  rootState,
  (state) => state.issueSet.issueSets[state.issueSet.currentIssueSetKey]?.issueKeys ?? [],
);

const selectLoading = createDraftSafeSelector(rootState, (state) => {
  return state.loading.import.loading;
});

const selectError = createDraftSafeSelector(rootState, (state) => {
  return state.loading.import.error;
});

/**
 * get methods to import issue and select/unselect issue to import
 */
export const useSynchronize = function useSynchronize(): Hook {
  const apiCredential = useGetApiCredential();
  const issueKeys = useAppSelector(currentIssueKeys, deepEqual);
  const error = useAppSelector(selectError);
  const loading = useAppSelector(selectLoading);
  const importIssues = useImportIssues();

  const sync = useCallback(() => {
    importIssues(issueKeys);
  }, [issueKeys, importIssues]);

  return { sync, error, isLoading: loading, isEnabled: apiCredential !== undefined && !loading };
};
