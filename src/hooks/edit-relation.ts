import { useCallback, useState } from "react";
import { useAppDispatch } from "./hooks";
import { useGetApiCredential } from "./get-api-credential";
import { useGetRelations } from "./get-relation";
import { IssueKey } from "@/type";
import { addRelationSucceeded, removeRelationSucceeded } from "@/state/actions";
import { Apis } from "@/apis/api";
import { Relation } from "@/model/issue";

interface UseEditRelationResult {
  /**
   * create relation fromKey to toKey
   */
  create: (toKey: IssueKey) => void;
  /**
   * remove relation between fromKey to toKey
   */
  remove: (toKey: IssueKey) => void;

  /**
   * return editing relation
   */
  isEditing: boolean;

  /**
   * error in editing
   */
  error?: string;
}

const findRelation = (relations: Relation[], issueKey: IssueKey) => {
  return relations.find((v) => {
    v.inwardIssue === issueKey || v.outwardIssue === issueKey;
  });
};

/**
 * get methods to edit relation between issues
 */
export const useEditRelation = function useEditRelation(fromKey: IssueKey): UseEditRelationResult {
  const relations = useGetRelations(fromKey);
  const apiCredential = useGetApiCredential();
  const dispatch = useAppDispatch();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const create = useCallback<UseEditRelationResult["create"]>(
    async (toKey) => {
      if (!apiCredential) {
        return;
      }
      try {
        setEditing(true);
        const relation = await Apis.createRelation.call(apiCredential, fromKey, toKey);
        dispatch(addRelationSucceeded(relation));
        setError(undefined);
      } catch {
        setError(`Error happened between ${fromKey} to ${toKey}. Please try again later`);
      } finally {
        setEditing(false);
      }
    },
    [fromKey, apiCredential],
  );
  const remove = useCallback<UseEditRelationResult["remove"]>(
    async (toKey) => {
      const relation = findRelation(relations ?? [], toKey);

      if (!apiCredential || !relation) {
        return;
      }

      try {
        setEditing(true);
        await Apis.removeRelation.call(apiCredential, relation.id);
        dispatch(removeRelationSucceeded({ relationId: relation.id }));
        setError(undefined);
      } catch {
        setError(`Error happened between ${fromKey} to ${toKey}. Please try again later`);
      } finally {
        setEditing(false);
      }
    },
    [fromKey, apiCredential],
  );

  return { create, remove, isEditing: editing, error };
};
