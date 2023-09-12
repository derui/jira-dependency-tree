import { useState } from "react";
import { useAppDispatch } from "./_internal-hooks";
import { changeGraphLayout } from "@/status/actions";
import { GraphLayout } from "@/type";

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
  const dispatch = useAppDispatch();
  const [state, setState] = useState<GraphLayout>(GraphLayout.Horizontal);

  const changeToVertical = () => {
    setState(GraphLayout.Vertical);
    dispatch(changeGraphLayout(GraphLayout.Vertical));
  };
  const changeToHorizontal = () => {
    setState(GraphLayout.Horizontal);
    dispatch(changeGraphLayout(GraphLayout.Horizontal));
  };

  return { state, changeToVertical, changeToHorizontal };
};
