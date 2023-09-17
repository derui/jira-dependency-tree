import type { Meta, StoryObj } from "@storybook/react";
import { Issue } from "./issue";

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
    issue: {
      key: "key",
      summary: "summary of issue",
      issueStatus: {
        id: "id",
        name: "Status",
        statusCategory: "To Do",
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
        statusCategory: "In progress",
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
        statusCategory: "Done",
      },
      issueType: {
        id: "id",
        avatarUrl: "",
        name: "type",
      },
    },
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};

export const Placeholder: Story = {
  args: {
    placeholder: true,
  },
};

export const Deletable: Story = {
  args: {
    onDelete: () => {},
    issue: {
      key: "key",
      summary: "summary of issue",
      issueStatus: {
        id: "id",
        name: "Status",
        statusCategory: "To Do",
      },
      issueType: {
        id: "id",
        avatarUrl: "",
        name: "type",
      },
    },
  },
};
