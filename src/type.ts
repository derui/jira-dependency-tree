export type IssueStatusCategory = {
  id: string;
  name: string;
  colorName: string;
};

export type IssueStatus = {
  id: string;
  name: string;
  categoryId: string;
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
