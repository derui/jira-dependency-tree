export type IssueStatus = Readonly<{
  id: string;
  name: string;
  statusCategory: string;
}>;

export type IssueType = Readonly<{
  id: string;
  name: string;
  avatarUrl: string | null;
}>;

export type IssueKey = string;
export type IssueTypeId = string;
export type IssueStatusId = string;
export type IssueStatusCategoryId = string;

export type Size = Readonly<{
  width: number;
  height: number;
}>;

export type Position = Readonly<{
  x: number;
  y: number;
}>;

export type IssueRelationId = string;

export type DeltaId = string;

export const GraphLayout = {
  Vertical: "vertical",
  Horizontal: "horizontal",
} as const;
export type GraphLayout = typeof GraphLayout[keyof typeof GraphLayout];
