import { IssueStatus, IssueStatusId, IssueType, IssueTypeId, IssueStatusCategory } from "@/type";

// JIRA's project representation
export type ProjectArgument = {
  // an id of project
  id: string;

  // a key of project
  key: string;

  // a name of project
  name: string;

  // status definitions in a project
  statuses?: IssueStatus[];

  // issue types in a project
  issueTypes?: IssueType[];

  // status categories in project
  statusCategories?: IssueStatusCategory[];
};

export type Project = {
  readonly id: string;
  readonly key: string;
  readonly name: string;

  findStatusBy(id: IssueStatusId): IssueStatus | undefined;

  findIssueTypeBy(id: IssueTypeId): IssueType | undefined;

  findStatusCategoryById(id: string): IssueStatusCategory | undefined;
};

export const projectFactory = function projectFactory(argument: ProjectArgument): Project {
  const id = argument.id;
  const key = argument.key;
  const name = argument.name;
  const statuses = argument.statuses ?? [];
  const issueTypes = argument.issueTypes ?? [];
  const statusCategories = argument.statusCategories ?? [];

  return {
    get id() {
      return id;
    },
    get key() {
      return key;
    },
    get name() {
      return name;
    },

    findStatusBy(id: IssueStatusId) {
      return statuses.find((v) => v.id === id);
    },

    findIssueTypeBy(id: IssueTypeId) {
      return issueTypes.find((v) => v.id === id);
    },

    findStatusCategoryById(id: string) {
      return statusCategories.find((v) => v.id === id);
    },
  };
};
