import type { Meta, StoryObj } from "@storybook/react";
import { IssueDetail } from "./issue-detail";
import { randomIssue } from "@/mock/generators";
import { issueToIssueModel } from "@/view-models/issue";

const meta = {
  title: "Molecules/Issue Detail",
  component: IssueDetail,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof IssueDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    issue: issueToIssueModel(randomIssue()),
  },
};
