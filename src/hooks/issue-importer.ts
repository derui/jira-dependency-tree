import { useCallback, useState } from "react";
import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { useAppSelector } from "./_internal-hooks";
import { useGetApiCredential } from "./get-api-credential";
import { useImportIssues } from "./_import-issues";
import { IssueKey } from "@/type";
import { RootState } from "@/status/store";

interface Hook {
  /**
   * toggle selecting an issue to import list
   */
  toggle: (key: IssueKey) => void;

  /**
   * select issues at once. This method does not toggle, only select
   */
  toggleMulti: (keys: IssueKey[]) => void;

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

const selectLoading = createDraftSafeSelector(
  (state: RootState) => state,
  (state) => {
    return state.loading.import.loading;
  },
);

const selectError = createDraftSafeSelector(
  (state: RootState) => state,
  (state) => {
    return state.loading.import.error;
  },
);

/**
 * get methods to import issue and select/unselect issue to import
 */
export const useIssueImporter = function useIssueImporter(): Hook {
  const apiCredential = useGetApiCredential();
  const [state, mutate] = useState<IssueKey[]>([]);
  const importIssues = useImportIssues();
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);

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

  const toggleMulti = (keys: IssueKey[]) => {
    mutate((state) => {
      const set = new Set(state);

      for (const key of keys) {
        if (set.has(key)) {
          set.delete(key);
        } else {
          set.add(key);
        }
      }

      return Array.from(set);
    });
  };

  const execute = useCallback(async () => {
    importIssues(state);
    mutate([]);
  }, [state, apiCredential, importIssues]);

  return { execute, toggle, toggleMulti, selectedIssues: state, error, isLoading: loading };
};
