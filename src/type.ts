/**
 * type and constants for loading state
 */
export const Loading = {
  Loading: "Loading",
  Completed: "Completed",
  Errored: "Errored",
} as const;
export type Loading = typeof Loading[keyof typeof Loading];

export const StatusCategory = {
  DONE: "DONE",
  IN_PROGRESS: "IN_PROGRESS",
  TODO: "TODO",
} as const;

export type StatusCategory = typeof StatusCategory[keyof typeof StatusCategory];

export type IssueStatusCategory = {
  id: string;
  name: string;
  colorName: string;
};

export type IssueStatus = {
  id: string;
  name: string;
  statusCategory: StatusCategory;
};

export type IssueType = {
  id: string;
  name: string;
  avatarUrl: string;
};

export type IssueTypeId = string;
export type IssueStatusId = string;
export type IssueStatusCategoryId = string;

export type Size = {
  width: number;
  height: number;
};

export type Position = {
  x: number;
  y: number;
};

export const LoaderStatus = {
  LOADING: "LOADING",
  COMPLETED: "COMPLETED",
} as const;

export type LoaderState = typeof LoaderStatus[keyof typeof LoaderStatus];
