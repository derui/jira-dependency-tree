import { useCallback, useState } from "react";
import { useAppDispatch } from "./_internal-hooks";
import { useGetApiCredential } from "./get-api-credential";
import { useGetRelations } from "./_get-relation";
import { useGetDelta } from "./_get-delta";
import { useGenerateId } from "./_generate-id";
import { DeltaId, IssueKey, IssueRelationId } from "@/type";
import * as Actions from "@/state/actions";
import { RelationDelta, createAppending, createDeleting } from "@/model/relation-delta";
import { RelationModel } from "@/model/relation";

type Touched = { kind: "Touched"; delta: RelationDelta };
type NoTouched = { kind: "NoTouched"; relation: RelationModel };

type Draft = Touched | NoTouched;

interface State {
  drafts: Draft[];
}

interface UseEditRelationResult {
  /**
   * create relation fromKey to toKey
   */
  create: (inward: IssueKey, outward: IssueKey) => void;
  /**
   * remove relation between fromKey to toKey
   */
  remove: (relation: IssueRelationId) => void;

  /**
   * undo delta
   */
  undo: (deltaId: DeltaId) => void;

  /**
   * apply drafts
   */
  apply: () => void;

  /**
   * return editing relation
   */
  isLoading: boolean;

  /**
   * error in editing
   */
  error?: string;

  state: State;
}

const toDrafts = (state: ReturnType<typeof useGetDelta>, relations: ReturnType<typeof useGetRelations>): Draft[] => {
  const appending: Draft[] = Object.values(state.appending).map((v) => {
    return { kind: "Touched", delta: v } as const;
  });
  return relations.relations
    .map<Draft>((v) => {
      const delta = Object.values(state.deleting).find((delta) => delta.relationId === v.relationId);
      if (!delta) {
        return { kind: "NoTouched", relation: v } as const;
      }

      return { kind: "Touched", delta } as const;
    })
    .concat(appending);
};

/**
 * get methods to edit relation between issues
 */
export const useRelationEditor = function useRelationEditor(): UseEditRelationResult {
  const generateId = useGenerateId();
  const relations = useGetRelations();
  const delta = useGetDelta();
  const apiCredential = useGetApiCredential();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const drafts = toDrafts(delta, relations);

  const create = useCallback<UseEditRelationResult["create"]>((inward, outward) => {
    const delta = createAppending(generateId(), inward, outward);

    dispatch(Actions.relations.appendDelta(delta));
  }, []);

  const remove = useCallback<UseEditRelationResult["remove"]>((relationId) => {
    const delta = createDeleting(generateId(), relationId);

    dispatch(Actions.relations.appendDelta(delta));
  }, []);

  const undo = useCallback<UseEditRelationResult["undo"]>((deltaId) => {
    dispatch(Actions.relations.deleteDelta(deltaId));
  }, []);

  const apply = useCallback<UseEditRelationResult["apply"]>(async () => {
    // todo
  }, [drafts]);

  return { create, remove, undo, apply, isLoading: loading, error, state: { drafts } };
};
