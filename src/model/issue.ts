import { IssueStatusId, IssueTypeId } from "@/type";

export interface Issue {
  key: string;
  summary: string;
  description: string;
  statusId: IssueStatusId;
  typeId: IssueTypeId;
  selfUrl: string;
  outwardIssueKeys: string[];
}
