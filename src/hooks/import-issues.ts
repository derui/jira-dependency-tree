import { useCallback, useState } from "react";
import { useAppDispatch } from "./_internal-hooks";
import { useGetApiCredential } from "./get-api-credential";
import { IssueKey } from "@/type";
import { importIssues } from "@/state/actions";
import { Apis } from "@/apis/api";

interface UseImportIssuesResult {
  /**
   * toggle selecting an issue to import list
   */
  toggle: (key: IssueKey) => void;

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

  const toggle = useCallback((key: IssueKey) => {
    mutate((state) => {
      const set = new Set(state);

      if (set.has(key)) {
        set.delete(key);
      } else {
        set.add(key);
      }

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

  return { execute, toggle, selectedIssues: state, error, isLoading: loading };
};
