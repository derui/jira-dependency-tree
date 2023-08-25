import { useCallback, useState } from "react";
import { useGetApiCredential } from "./get-api-credential";
import { Apis } from "@/apis/api";
import { Issue } from "@/model/issue";

interface UseSearchIssueResult {
  isLoading: boolean;
  error?: string;
  data?: Issue[];
  search: (jql: string, page?: number) => void;
}

/**
 * search issue with jql
 */
export const useSearchIssues = function useSearchIssues(): UseSearchIssueResult {
  const [state, mutate] = useState<Omit<UseSearchIssueResult, "search">>({ isLoading: false });
  const apiCredential = useGetApiCredential();

  const search = useCallback<UseSearchIssueResult["search"]>(
    (jql, page = 0) => {
      if (apiCredential && jql) {
        mutate((state) => ({ ...state, isLoading: true, error: undefined }));
        Apis.searchIssues
          .call(apiCredential, jql)
          .then(([issues, error]) => {
            if (!error) {
              mutate({ isLoading: false, data: issues });
            } else {
              mutate({ isLoading: false, error });
            }
          })
          .catch(() => {
            mutate({ isLoading: false, error: "Error occurred" });
          });
      }
    },
    [apiCredential],
  );

  return { ...state, search };
};
