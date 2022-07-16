import { IssueStatus, IssueStatusId, IssueType, IssueTypeId, IssueStatusCategory } from "@/type";

// JIRA's project representation
export type ProjectBase = {
  // an id of project
  id: string;

  // a key of project
  key: string;

  // a name of project
  name: string;

  // status definitions in a project
  statuses: IssueStatus[];

  // issue types in a project
  issueTypes: IssueType[];

  // status categories in project
  statusCategories: IssueStatusCategory[];
};

export class Project {
  private _statuses: IssueStatus[];
  private _issueTypes: IssueType[];
  private _statusCategories: IssueStatusCategory[];
  readonly id: string;
  readonly key: string;
  readonly name: string;

  constructor(arg: ProjectBase) {
    this.id = arg.id;
    this.key = arg.key;
    this.name = arg.name;
    this._statuses = arg.statuses;
    this._issueTypes = arg.issueTypes;
    this._statusCategories = arg.statusCategories;
  }

  findStatusBy(id: IssueStatusId) {
    return this._statuses.find((v) => v.id === id);
  }

  findIssueTypeBy(id: IssueTypeId) {
    return this._issueTypes.find((v) => v.id === id);
  }

  findStatusCategoryById(id: string) {
    return this._statusCategories.find((v) => v.id === id);
  }
}
