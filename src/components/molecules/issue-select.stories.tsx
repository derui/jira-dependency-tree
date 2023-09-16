import type { Meta, StoryObj } from "@storybook/react";
import { IssueSelect } from "./issue-select";
import { randomIssue } from "@/mock/generators";
import { issueToIssueModel } from "@/view-models/issue";

const meta = {
  title: "Molecules/Issue Select",
  component: IssueSelect,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof IssueSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    issues: [
      issueToIssueModel(randomIssue()),
      issueToIssueModel(randomIssue()),
      issueToIssueModel(randomIssue()),
      issueToIssueModel(randomIssue()),
      issueToIssueModel(randomIssue()),
    ],
  },
};
