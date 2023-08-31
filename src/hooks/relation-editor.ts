import { useCallback, useState } from "react";
import { useAppDispatch } from "./_internal-hooks";
import { useGetApiCredential } from "./get-api-credential";
import { useGetRelations } from "./_get-relation";
import { IssueKey, IssueRelationId } from "@/type";
import { addRelationSucceeded, removeRelationSucceeded } from "@/state/actions";
import { Apis } from "@/apis/api";
import { IssueModel } from "@/view-models/issue";

interface State {
  inwardIssues: {
    relationId: IssueRelationId;
    issue: IssueModel;
  }[];

  outwardIssues: {
    relationId: IssueRelationId;
    issue: IssueModel;
  }[];
}

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

  state: State;
}

/**
 * get methods to edit relation between issues
 */
export const useEditRelation = function useRelationEditor(fromKey: IssueKey): UseEditRelationResult {
  const { inwardIssues, outwardIssues } = useGetRelations();
  const relationIds = inwardIssues.map((v) => v.relationId).concat(outwardIssues.map((v) => v.relationId));
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
    async (relationId) => {
      const contains = relationIds.includes(relationId);

      if (!apiCredential || !contains) {
        return;
      }

      try {
        setEditing(true);
        await Apis.removeRelation.call(apiCredential, relationId);
        dispatch(removeRelationSucceeded({ relationId }));
        setError(undefined);
      } catch {
        setError(`Error happened between ${relationId}. Please try again later`);
      } finally {
        setEditing(false);
      }
    },
    [fromKey, apiCredential],
  );

  return { create, remove, isEditing: editing, error, state: { inwardIssues, outwardIssues } };
};
