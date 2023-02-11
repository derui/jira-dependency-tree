import { IssueKey, IssueRelationExternalId, IssueRelationId, IssueStatusId, IssueTypeId } from "@/type";

export interface Relation {
  id: IssueRelationId;
  /**
   * external id is ID of JIRA
   */
  externalId: IssueRelationExternalId;

  inwardIssue: string;
  outwardIssue: string;
}

export interface Issue {
  key: IssueKey;
  summary: string;
  description: string;
  statusId: IssueStatusId;
  typeId: IssueTypeId;
  selfUrl: string;
  relations: Relation[];
  parentIssue?: string;
  subIssues: IssueKey[];
}

/**
 * return issue keys that are outward direction from `issue`.
 */
export const selectOutwardIssues = (issue: Issue): string[] => {
  return issue.relations.filter((relation) => relation.inwardIssue === issue.key).map((v) => v.outwardIssue);
};
