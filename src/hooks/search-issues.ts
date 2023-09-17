import { useCallback, useState } from "react";
import { useGetApiCredential } from "./get-api-credential";
import { Apis } from "@/apis/api";
import { IssueModel, issueToIssueModel } from "@/view-models/issue";

interface UseSearchIssueState {
  readonly isLoading: boolean;
  readonly error?: string;
  readonly data?: ReadonlyArray<IssueModel>;
}
type search = (jql: string) => void;
type paginate = (page: number) => void;

type UseSearchIssueResult = {
  readonly state: UseSearchIssueState;
  readonly search: search;
  readonly paginate: paginate;
  readonly reset: () => void;
};

/**
 * search issue with jql
 */
export const useSearchIssues = function useSearchIssues(): UseSearchIssueResult {
  const [previousQuery, setPreviousQuery] = useState("");
  const [state, mutate] = useState<UseSearchIssueState>({ isLoading: false });
  const apiCredential = useGetApiCredential();

  const search = useCallback<search>(
    (jql) => {
      if (apiCredential && jql) {
        setPreviousQuery(jql);
        mutate((state) => ({ ...state, isLoading: true, error: undefined }));
        Apis.searchIssues
          .call(apiCredential, jql)
          .then(([issues, error]) => {
            if (!error) {
              mutate((state) => ({ ...state, isLoading: false, data: issues.map(issueToIssueModel) }));
            } else {
              mutate((state) => ({ ...state, isLoading: false, error, data: [] }));
            }
          })
          .catch((e) => {
            console.error(e);
            mutate((state) => ({ ...state, isLoading: false, error: "Error occurred" }));
          });
      }
    },
    [apiCredential],
  );

  const paginate = useCallback<paginate>(
    (page) => {
      if (apiCredential && previousQuery) {
        mutate((state) => ({ ...state, isLoading: true, error: undefined }));
        Apis.searchIssues
          .call(apiCredential, previousQuery, page)
          .then(([issues, error]) => {
            if (!error) {
              mutate((state) => ({ ...state, isLoading: false, data: issues.map(issueToIssueModel) }));
            } else {
              mutate((state) => ({ ...state, isLoading: false, error, data: [] }));
            }
          })
          .catch((e) => {
            console.error(e);
            mutate((state) => ({ ...state, isLoading: false, error: "Error occurred" }));
          });
      }
    },
    [apiCredential, previousQuery],
  );

  const reset = () => {
    mutate({ isLoading: false });
  };

  return { state, search, paginate, reset };
};
