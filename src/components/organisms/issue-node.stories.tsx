import type { Meta, StoryObj } from "@storybook/react";
import { IssueNode } from "./issue-node";
import { randomIssue } from "@/mock/generators";
import { issueToIssueModel } from "@/view-models/issue";

const meta = {
  title: "Organisms/Issue Node",
  component: IssueNode,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof IssueNode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    layout: {
      issue: issueToIssueModel(randomIssue()),
      meta: {
        colIndex: 0,
        rowIndex: 0,
      },
      position: { x: 10, y: 20 },
      size: { width: 160, height: 100 },
    },
  },
  render(args) {
    return (
      <svg width="100%" height="100%">
        <IssueNode {...args} />
      </svg>
    );
  },
};
