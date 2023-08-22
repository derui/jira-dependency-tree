import { useCallback } from "react";
import { useAppDispatch } from "./hooks";
import { IssueKey } from "@/type";
import { addRelation, removeRelation } from "@/state/actions";

interface UseEditRelationResult {
  /**
   * create relation fromKey to toKey
   */
  create: (toKey: IssueKey) => void;
  /**
   * remove relation between fromKey to toKey
   */
  remove: (toKey: IssueKey) => void;
}

/**
 * get methods to edit relation between issues
 */
export const useEditRelation = function useEditRelation(fromKey: IssueKey): UseEditRelationResult {
  const dispatch = useAppDispatch();
  const create = useCallback<UseEditRelationResult["create"]>(
    (toKey) => {
      dispatch(addRelation({ fromKey, toKey }));
    },
    [fromKey],
  );
  const remove = useCallback<UseEditRelationResult["remove"]>(
    (toKey) => {
      dispatch(removeRelation({ fromKey, toKey }));
    },
    [fromKey],
  );

  return { create, remove };
};
