import { IssueRelationId } from "@/type";
import { IssueModel } from "@/view-models/issue";

/**
 * A simple relation model.
 */
export interface RelationModel {
  readonly relationId: IssueRelationId;
  readonly inward: IssueModel;
  readonly outward: IssueModel;
}
