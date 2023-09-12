import { useAppDispatch } from "../_internal-hooks";
import { IssueKey } from "@/type";
import { selectIssueInGraph } from "@/status/actions";

type Result = {
  /**
   * select issue in layout
   */
  select: (key: IssueKey) => void;
};

/**
 * select node in graph.
 */
export const useSelectNode = function useSelectNode(): Result {
  const dispatch = useAppDispatch();

  const select = (key: IssueKey) => {
    dispatch(selectIssueInGraph(key));
  };

  return { select };
};
