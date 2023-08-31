import { IssueRelationId } from "@/type";
import { IssueModel } from "@/view-models/issue";

/**
 * A simple relation model.
 */
export interface RelationModel {
  relationId: IssueRelationId;
  inward: IssueModel;
  outward: IssueModel;
}
