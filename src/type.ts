export const StatusCategory = {
  DONE: "DONE",
  IN_PROGRESS: "IN_PROGRESS",
  TODO: "TODO",
} as const;

export type StatausCategory = typeof StatusCategory[keyof typeof StatusCategory];

export type IssueStatusCategory = {
  id: string;
  name: string;
  colorName: string;
};

export type IssueStatus = {
  id: string;
  name: string;
  statusCategory: StatausCategory;
};

export type IssueType = {
  id: string;
  name: string;
  avatarUrl: string;
};

export type IssueTypeId = string;
export type IssueStatusId = string;

export type Size = {
  width: number;
  height: number;
};

export type Position = {
  x: number;
  y: number;
};
