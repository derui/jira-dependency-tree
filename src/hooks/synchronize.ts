import { useCallback, useState } from "react";
import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { useAppDispatch, useAppSelector } from "./_internal-hooks";
import { useGetApiCredential } from "./get-api-credential";
import { importIssues } from "@/state/actions";
import { Apis } from "@/apis/api";
import { RootState } from "@/state/store";

interface UseSynchronizeResult {
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
}

const currentIssueKeys = createDraftSafeSelector(
  (state: RootState) => state,
  (state) => state.issues.issues.map((v) => v.key),
);

/**
 * get methods to import issue and select/unselect issue to import
 */
export const useSynchronize = function useSynchronize(): UseSynchronizeResult {
  const apiCredential = useGetApiCredential();
  const dispatch = useAppDispatch();
  const issueKeys = useAppSelector(currentIssueKeys);
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const sync = useCallback(async () => {
    if (!apiCredential) {
      return;
    }

    try {
      setLoading(true);
      setError(undefined);
      const issues = await Apis.getIssues.call(apiCredential, issueKeys);
      dispatch(importIssues({ issues: issues }));
    } catch {
      setError("Synchronizing failed");
    } finally {
      setLoading(false);
    }
  }, [issueKeys, apiCredential]);

  return { sync, error, isLoading: loading };
};
