import { useCallback, useState } from "react";
import { useAppDispatch } from "./hooks";
import { useGetApiCredential } from "./get-api-credential";
import { IssueKey } from "@/type";
import { importIssues } from "@/state/actions";
import { Apis } from "@/apis/api";

interface UseImportIssuesResult {
  /**
   * select an issue to import list
   */
  select: (key: IssueKey) => void;
  /**
   * unselect an issue from import list
   */
  unselect: (key: IssueKey) => void;

  /**
   * execute importing
   */
  execute: () => void;

  /**
   * current selected issue keys
   */
  selectedIssues: IssueKey[];

  isLoading: boolean;
  error?: string;
}

/**
 * get methods to import issue and select/unselect issue to import
 */
export const useImportIssues = function useImportIssues(): UseImportIssuesResult {
  const apiCredential = useGetApiCredential();
  const [state, mutate] = useState<IssueKey[]>([]);
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const select = useCallback((key: IssueKey) => {
    mutate((state) => {
      const set = new Set(state);
      set.add(key);

      return Array.from(set);
    });
  }, []);
  const unselect = useCallback((key: IssueKey) => {
    mutate((state) => {
      const set = new Set(state);
      set.delete(key);

      return Array.from(set);
    });
  }, []);

  const execute = useCallback(async () => {
    if (!apiCredential) {
      return;
    }

    try {
      setLoading(true);
      setError(undefined);
      const issues = await Apis.getIssues.call(apiCredential, state);
      dispatch(importIssues({ issues: issues }));
    } catch {
      setError("Import error");
    } finally {
      setLoading(false);
    }
  }, [state, apiCredential]);

  return { execute, select, unselect, selectedIssues: state, error, isLoading: loading };
};
