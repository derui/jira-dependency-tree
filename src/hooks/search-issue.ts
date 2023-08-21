import { Issue } from "@/model/issue";

interface UseSearchIssueResult {
  isLoading: boolean;
  error?: string;
  data: Issue[];
}

/**
 * seach issue with jql
 */
export const useSearchIssue = function useSearchIssue(jql: string, page: number = 0): UseSearchIssueResult {};
