import { IssueStatus, IssueType } from "./type";

// JIRA's project representation
export type ProjectBase = {
  // an id of project
  id: string;

  // a key of project
  key: string;

  // status definitions in a project
  statuses: IssueStatus[];

  // issue types in a project
  issueTypes: IssueType[];
};

export class Project {
  private _statuses: IssueStatus[];
  private _issueTypes: IssueType[];
  readonly id: string;
  readonly key: string;

  constructor(arg: ProjectBase) {
    this.id = arg.id;
    this.key = arg.key;
    this._statuses = arg.statuses;
    this._issueTypes = arg.issueTypes;
  }

  findStatusBy(id: string) {
    return this._statuses.find((v) => v.id === id);
  }

  findIssueTypeBy(id: string) {
    return this._issueTypes.find((v) => v.id === id);
  }
}
