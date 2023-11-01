import type { Meta, StoryObj } from "@storybook/react";
import { Issue } from "./issue";
import { issueToIssueModel, makeLoadingIssue } from "@/view-models/issue";
import { randomIssue } from "@/mock/generators";

const meta = {
  title: "Molecules/Issue",
  component: Issue,
  tags: ["autodocs"],
  argTypes: {
    issue: { control: "object" },
    loading: { control: "boolean" },
    placeholder: { control: "boolean" },
  },
} satisfies Meta<typeof Issue>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TODO: Story = {
  args: {
    issue: issueToIssueModel(
      randomIssue({
        key: "key",
        summary: "summary of issue",
        status: {
          id: "id",
          name: "Status",
          statusCategory: "To Do",
        },
        type: {
          id: "id",
          avatarUrl: "",
          name: "type",
        },
      }),
    ),
  },
};

export const InProgress: Story = {
  args: {
    issue: issueToIssueModel(
      randomIssue({
        key: "key",
        summary: "summary of issue",
        status: {
          id: "id",
          name: "Status",
          statusCategory: "In progress",
        },
        type: {
          id: "id",
          avatarUrl: "",
          name: "type",
        },
      }),
    ),
  },
};

export const DONE: Story = {
  args: {
    issue: issueToIssueModel(
      randomIssue({
        key: "key",
        summary: "summary of issue",
        status: {
          id: "id",
          name: "Status",
          statusCategory: "Done",
        },
        type: {
          id: "id",
          avatarUrl: "",
          name: "type",
        },
      }),
    ),
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};

export const LoadingFromIssue: Story = {
  args: {
    issue: makeLoadingIssue("key"),
  },
};

export const Deletable: Story = {
  args: {
    onDelete: () => {},
    issue: issueToIssueModel(
      randomIssue({
        key: "key",
        summary: "summary of issue",
        status: {
          id: "id",
          name: "Status",
          statusCategory: "To Do",
        },
        type: {
          id: "id",
          avatarUrl: "",
          name: "type",
        },
      }),
    ),
  },
};
