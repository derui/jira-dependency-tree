import { IssueModel } from "./issue";
import { DeltaId, IssueKey, IssueRelationId } from "@/type";
import { RelationModel } from "@/view-models/relation";
import { AppendingRelationDelta, DeletingRelationDelta } from "@/models/relation-delta";

export type AppendingRelationDeltaModel = {
  kind: "append";
  deltaId: DeltaId;
  inwardIssue: IssueModel;
  outwardIssue: IssueModel;
};

export type DeletingRelationDeltaModel = {
  kind: "delete";
  deltaId: DeltaId;
  relation: RelationModel;
};

export type RelationDeltaModel = AppendingRelationDeltaModel | DeletingRelationDeltaModel;

/**
 * create delta for appending
 */
export const toAppendingModel = function toAppendingModel(
  delta: AppendingRelationDelta,
  issues: Record<IssueKey, IssueModel>,
): AppendingRelationDeltaModel {
  const inward = issues[delta.inwardIssue];
  const outward = issues[delta.outwardIssue];

  if (!inward || !outward) {
    throw new Error("Does not match between issues and keys");
  }
  return {
    kind: "append",
    deltaId: delta.deltaId,
    inwardIssue: inward,
    outwardIssue: outward,
  };
};

/**
 * create delta for deleting
 */
export const toDeletingModel = function toDeletingModel(
  delta: DeletingRelationDelta,
  relations: Record<IssueRelationId, RelationModel>,
): DeletingRelationDeltaModel {
  const relation = relations[delta.relationId];
  if (!relation) {
    throw new Error("Do not match between relation");
  }

  return {
    kind: "delete",
    deltaId: delta.deltaId,
    relation,
  };
};
