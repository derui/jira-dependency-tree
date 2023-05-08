import type { Meta, StoryObj } from "@storybook/react";
import { Issue } from "./issue";
import { Loading } from "@/type";

const meta = {
  title: "Molecules/Issue",
  component: Issue,
  tags: ["autodocs"],
  argTypes: {
    issue: { control: "object" },
    loading: { control: "radio", options: Object.keys(Loading), defaultValue: Loading.Completed },
  },
} satisfies Meta<typeof Issue>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TODO: Story = {
  args: {
    issue: {
      key: "key",
      summary: "summary of issue",
      issueStatus: {
        id: "id",
        name: "Status",
        statusCategory: "TODO",
      },
      issueType: {
        id: "id",
        avatarUrl: "",
        name: "type",
      },
    },
  },
};

export const InProgress: Story = {
  args: {
    issue: {
      key: "key",
      summary: "summary of issue",
      issueStatus: {
        id: "id",
        name: "Status",
        statusCategory: "IN_PROGRESS",
      },
      issueType: {
        id: "id",
        avatarUrl: "",
        name: "type",
      },
    },
  },
};

export const DONE: Story = {
  args: {
    issue: {
      key: "key",
      summary: "summary of issue",
      issueStatus: {
        id: "id",
        name: "Status",
        statusCategory: "DONE",
      },
      issueType: {
        id: "id",
        avatarUrl: "",
        name: "type",
      },
    },
  },
};
