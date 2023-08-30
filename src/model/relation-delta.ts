import { DeltaId, IssueKey, IssueRelationId } from "@/type";

export type AppendingRelationDelta = {
  kind: "append";
  deltaId: DeltaId;
  inwardIssue: IssueKey;
  outwardIssue: IssueKey;
};

export type DeletingRelationDelta = {
  kind: "delete";
  deltaId: DeltaId;
  relationId: IssueRelationId;
};

export type RelationDelta = AppendingRelationDelta | DeletingRelationDelta;

/**
 * create delta for appending
 */
export const createAppending = function createAppending(
  id: DeltaId,
  inward: IssueKey,
  outward: IssueKey,
): AppendingRelationDelta {
  return {
    kind: "append",
    deltaId: id,
    inwardIssue: inward,
    outwardIssue: outward,
  };
};

/**
 * create delta for deleting
 */
export const createDeleting = function createDeleting(id: DeltaId, relationId: IssueRelationId): DeletingRelationDelta {
  return {
    kind: "delete",
    deltaId: id,
    relationId,
  };
};
