import { IssueKey } from "@/type";

/**
 * set of issue to restore
 */
export interface IssueSet {
  name: string;
  issueKeys: IssueKey[];
}
