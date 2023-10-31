import { Issue } from "@/models/issue";
import { IssueKey, IssueStatus, IssueType } from "@/type";

const Loaded = Symbol("Loaded");
const Loading = Symbol("Loading");

/**
 * A view model for issue
 */
interface LoadedIssueModel {
  readonly kind: typeof Loaded;
  readonly key: IssueKey;
  readonly summary: string;
  readonly issueStatus?: IssueStatus;
  readonly issueType?: IssueType;
}

interface LoadingIssueModel {
  readonly kind: typeof Loading;
  readonly key: IssueKey;
}

export type IssueModel = LoadedIssueModel | LoadingIssueModel;

export const isLoadingIssueModel = (model: IssueModel): model is LoadingIssueModel => {
  return model.kind == Loading;
};

export const isLoadedIssueModel = (model: IssueModel): model is LoadedIssueModel => {
  return model.kind == Loaded;
};

/**
 * converter to convert from issue to issue model
 */
export const issueToIssueModel = (issue: Issue): IssueModel => {
  return {
    kind: Loaded,
    key: issue.key,
    summary: issue.summary,
    issueStatus: issue.status,
    issueType: issue.type,
  };
};

/**
 * make loading issues
 */
export const makeLoadingIssue = (issueKey: IssueKey): IssueModel => {
  return {
    kind: Loading,
    key: issueKey,
  };
};
