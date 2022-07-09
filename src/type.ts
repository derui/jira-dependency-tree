export const ISSUE_CATEGORY = {
  DONE: "DONE",
  IN_PROGRESS: "IN_PROGRESS",
  TODO: "TODO",
} as const;

export type IssueCategory = typeof ISSUE_CATEGORY[keyof typeof ISSUE_CATEGORY];

export type IssueStatus = {
  id: string;
  name: string;
  category: IssueCategory;
};

export type IssueType = {
  id: string;
  name: string;
  avatarUrl: string;
};
