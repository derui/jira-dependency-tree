import { useEffect, useState } from "react";
import { useGetApiCredential } from "./get-api-credential";
import { Apis } from "@/apis/api";
import { Issue } from "@/model/issue";

interface UseSearchIssueResult {
  isLoading: boolean;
  error?: string;
  data?: Issue[];
}

const initialResult: UseSearchIssueResult = {
  isLoading: true,
} satisfies UseSearchIssueResult;

/**
 * seach issue with jql
 */
export const useSearchIssues = function useSearchIssues(jql: string, page: number = 0): UseSearchIssueResult {
  const [state, mutate] = useState(initialResult);
  const apiCredential = useGetApiCredential();

  useEffect(() => {
    if (apiCredential && jql) {
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

    return;
  }, [apiCredential, jql, page]);

  return state;
};
