import { useAppDispatch } from "../_internal-hooks";
import { IssueKey } from "@/type";
import { removeNode } from "@/status/actions";

type Result = {
  /**
   * remove issue from graph
   */
  remove: (key: IssueKey) => void;
};

/**
 * select node in graph.
 */
export const useRemoveNode = function useRemoveNode(): Result {
  const dispatch = useAppDispatch();

  const remove = (key: IssueKey) => {
    dispatch(removeNode(key));
  };

  return { remove };
};
