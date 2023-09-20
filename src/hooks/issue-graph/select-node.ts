import { useAppDispatch } from "../_internal-hooks";
import { IssueKey } from "@/type";
import { deselectIssueInGraph, selectIssueInGraph } from "@/status/actions";

type Result = {
  /**
   * select issue in layout
   */
  select: (key: IssueKey) => void;

  /**
   * deselect issue in layout
   */
  deselect: (key: IssueKey) => void;
};

/**
 * select node in graph.
 */
export const useSelectNode = function useSelectNode(): Result {
  const dispatch = useAppDispatch();

  const select = (key: IssueKey) => {
    dispatch(selectIssueInGraph(key));
  };

  const deselect = (key: IssueKey) => {
    dispatch(deselectIssueInGraph(key));
  };

  return { select, deselect };
};
