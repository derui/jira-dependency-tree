export type IssueStatus = {
  id: string;
  name: string;
  statusCategory: string;
};

export type IssueType = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

export type IssueKey = string;
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

export type IssueRelationId = string;

export type DeltaId = string;

export const GraphLayout = {
  Vertical: "vertical",
  Horizontal: "horizontal",
} as const;
export type GraphLayout = typeof GraphLayout[keyof typeof GraphLayout];
