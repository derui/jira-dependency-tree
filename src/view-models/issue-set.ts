import { IssueSet } from "@/models/issue-set";
import { IssueKey } from "@/type";

/**
 * A view model for issue set
 */
export interface IssueSetModel {
  readonly name: string;
  readonly keys: ReadonlyArray<IssueKey>;
}

/**
 * converter to convert from issue set to issue set model
 */
export const issueSetToIssueSetModel = (issue: IssueSet): IssueSetModel => {
  return {
    name: issue.name,
    keys: ([] as IssueKey[]).concat(issue.issueKeys),
  };
};
