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
import { Apis } from "@/apis/api";
import { Relation } from "@/model/issue";

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

const mergeDeltaInDrafts = function mergeDraft(drafts: Draft[]): RelationDelta[] {
  const deltas: RelationDelta[] = [];

  drafts.forEach((draft) => {
    switch (draft.kind) {
      case "NoTouched":
        break;
      case "Touched": {
        switch (draft.delta.kind) {
          case "append": {
            const delta = draft.delta;
            const exists = deltas.some(
              (v) =>
                v.kind === "append" && v.inwardIssue === delta.inwardIssue && v.outwardIssue === delta.outwardIssue,
            );

            if (!exists) {
              deltas.push(delta);
            }
            break;
          }
          case "delete":
            deltas.push(draft.delta);
            break;
        }
      }
    }
  });

  return deltas;
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

  const create = (inward: IssueKey, outward: IssueKey) => {
    const delta = createAppending(generateId(), inward, outward);

    dispatch(Actions.relations.appendDelta(delta));
  };

  const remove = (relationId: IssueRelationId) => {
    const delta = createDeleting(generateId(), relationId);

    dispatch(Actions.relations.appendDelta(delta));
  };

  const undo = (deltaId: DeltaId) => {
    dispatch(Actions.relations.deleteDelta(deltaId));
  };

  const apply = useCallback<UseEditRelationResult["apply"]>(async () => {
    const mergedDeltas = mergeDeltaInDrafts(drafts);

    if (!apiCredential || mergedDeltas.length === 0) {
      return;
    }

    setLoading(true);

    Promise.all(
      mergedDeltas.map((delta) => {
        switch (delta.kind) {
          case "append":
            return Apis.createRelation.call(apiCredential, delta.inwardIssue, delta.outwardIssue);
          case "delete":
            return Apis.removeRelation.call(apiCredential, delta.relationId);
        }
      }),
    )
      .then((result) => {
        const payload = result.reduce<{ appended: Relation[]; removed: IssueRelationId[] }>(
          (accum, v) => {
            if (typeof v === "string") {
              accum.removed.push(v);
            } else {
              accum.appended.push(v);
            }

            return accum;
          },
          { removed: [], appended: [] },
        );

        dispatch(Actions.relations.reflect(payload));
      })
      .catch(() => {
        setError("Error happend to apply. Please apply after");
      })
      .finally(() => {
        setLoading(false);
        dispatch(Actions.relations.reset());
      });
  }, [drafts, apiCredential]);

  return { create, remove, undo, apply, isLoading: loading, error, state: { drafts } };
};
