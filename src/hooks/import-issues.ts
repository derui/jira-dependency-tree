import { useCallback, useState } from "react";
import { useAppDispatch } from "./hooks";
import { IssueKey } from "@/type";
import { importIssues } from "@/state/actions";

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
}

/**
 * get methods to import issue and select/unselect issue to import
 */
export const useImportIssues = function useImportIssues(): UseImportIssuesResult {
  const [state, mutate] = useState<IssueKey[]>([]);
  const dispatch = useAppDispatch();
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

  const execute = useCallback(() => {
    dispatch(importIssues({ issues: state }));
  }, [state]);

  return { execute, select, unselect, selectedIssues: state };
};
