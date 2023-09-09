import { IssueKey, IssueRelationId, IssueStatus, IssueType } from "@/type";

export interface Relation {
  id: IssueRelationId;
  inwardIssue: string;
  outwardIssue: string;
}

export interface Issue {
  key: IssueKey;
  summary: string;
  description: string;
  status: IssueStatus;
  type: IssueType;
  selfUrl: string;
  relations: Relation[];
  parentIssue?: string;
  subIssues: IssueKey[];
}
