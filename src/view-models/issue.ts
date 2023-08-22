import { Issue } from "@/model/issue";
import { Project } from "@/model/project";
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
export const issueToIssueModel = (project: Project, issue: Issue): IssueModel => {
  return {
    key: issue.key,
    summary: issue.summary,
    issueStatus: project.statuses[issue.status],
    issueType: project.issueTypes[issue.type],
  };
};
