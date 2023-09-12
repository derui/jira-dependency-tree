import { useAppDispatch } from "./_internal-hooks";
import { IssueKey } from "@/type";
import { attentionIssue } from "@/status/actions";

/**
 * get function to focus issue
 */
export const useFocusIssue = function useFocusIssue(): (key: IssueKey) => void {
  const dispatch = useAppDispatch();

  return (key: IssueKey) => dispatch(attentionIssue(key));
};
