import { IssueStatus, IssueStatusId, IssueType, IssueTypeId, IssueStatusCategory, IssueStatusCategoryId } from "@/type";

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

export interface Project {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly statuses: Record<IssueStatusId, IssueStatus | undefined>;
  readonly issueTypes: Record<IssueTypeId, IssueType | undefined>;
  readonly statusCategories: Record<IssueStatusCategoryId, IssueStatusCategory | undefined>;
}

export const projectFactory = function projectFactory(argument: ProjectArgument): Project {
  const id = argument.id;
  const key = argument.key;
  const name = argument.name;
  const statuses = (argument.statuses ?? []).reduce<Record<IssueStatusId, IssueStatus | undefined>>((accum, v) => {
    accum[v.id] = v;
    return accum;
  }, {});
  const issueTypes = (argument.issueTypes ?? []).reduce<Record<IssueTypeId, IssueType | undefined>>((accum, v) => {
    accum[v.id] = v;
    return accum;
  }, {});
  const statusCategories = (argument.statusCategories ?? []).reduce<
    Record<IssueStatusCategoryId, IssueStatusCategory | undefined>
  >((accum, v) => {
    accum[v.id] = v;
    return accum;
  }, {});

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

    get statuses() {
      return Object.assign({}, statuses);
    },

    get issueTypes() {
      return Object.assign({}, issueTypes);
    },

    get statusCategories() {
      return Object.assign({}, statusCategories);
    },
  };
};
