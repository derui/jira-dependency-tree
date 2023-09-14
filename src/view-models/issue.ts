import { Issue } from "@/models/issue";
import { IssueKey, IssueStatus, IssueType } from "@/type";

/**
 * A view model for issue
 */
export interface IssueModel {
  readonly key: IssueKey;
  readonly summary: string;
  readonly issueStatus?: IssueStatus;
  readonly issueType?: IssueType;
}

/**
 * converter to convert from issue to issue model
 */
export const issueToIssueModel = (issue: Issue): IssueModel => {
  return {
    key: issue.key,
    summary: issue.summary,
    issueStatus: issue.status,
    issueType: issue.type,
  };
};
