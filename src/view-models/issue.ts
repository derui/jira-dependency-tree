import { Issue } from "@/model/issue";
import { IssueKey, IssueStatus, IssueType } from "@/type";

/**
 * A view model for issue
 */
export interface IssueModel {
  key: IssueKey;
  summary: string;
  issueStatus?: IssueStatus;
  issueType?: IssueType;
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
