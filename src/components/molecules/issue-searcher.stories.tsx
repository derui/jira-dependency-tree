import type { Meta, StoryObj } from "@storybook/react";
import { IssueSearcher } from "./issue-searcher";

const meta = {
  title: "Molecules/Issue Searcher",
  component: IssueSearcher,
  tags: ["autodocs"],
  argTypes: {
    loading: { control: "boolean" },
  },
} satisfies Meta<typeof IssueSearcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: {
    loading: true,
  },
};
