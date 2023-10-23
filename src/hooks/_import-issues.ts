import { useCallback } from "react";
import { useAppDispatch } from "./_internal-hooks";
import { useGetApiCredential } from "./get-api-credential";
import { IssueKey } from "@/type";
import { importIssues, loading } from "@/status/actions";
import { Apis } from "@/apis/api";

/**
 * execute keys
 */
type Hook = (keys: IssueKey[]) => void;

/**
 * get methods to import issue and select/unselect issue to import
 */
export const useImportIssues = function useImportIssues(): Hook {
  const apiCredential = useGetApiCredential();
  const dispatch = useAppDispatch();

  const execute = useCallback<Hook>(
    async (keys) => {
      if (!apiCredential) {
        return;
      }

      try {
        dispatch(loading.startImport());
        const issues = await Apis.getIssues.call(apiCredential, keys);
        dispatch(importIssues({ issues: issues }));
      } catch {
        dispatch(loading.errorImport("Import error"));
      } finally {
        dispatch(loading.finishImport());
      }
    },
    [apiCredential],
  );

  return execute;
};
