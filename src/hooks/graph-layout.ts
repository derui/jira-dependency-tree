import { useState } from "react";
import { GraphLayout } from "@/drivers/issue-graph/type";

interface UseGraphLayoutResult {
  /**
   * change to vertical layout
   */
  changeToVertical: () => void;

  /**
   * change to horizontal layout
   */
  changeToHorizontal: () => void;
  state: GraphLayout;
}

/**
 * get logic and states to manage GraphLayout
 */
export const useGraphLayout = function useGraphLayout(): UseGraphLayoutResult {
  const [state, setState] = useState<GraphLayout>(GraphLayout.Horizontal);

  const changeToVertical = () => {
    setState(GraphLayout.Vertical);
  };
  const changeToHorizontal = () => {
    setState(GraphLayout.Horizontal);
  };

  return { state, changeToVertical, changeToHorizontal };
};
