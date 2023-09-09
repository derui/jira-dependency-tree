import type { Meta, StoryObj } from "@storybook/react";
import { AppendingPreparation } from "./appending-preparation";
import { randomIssue } from "@/mock/generators";
import { issueToIssueModel } from "@/view-models/issue";

const meta = {
  title: "Organisms/Appending Preparation",
  component: AppendingPreparation,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof AppendingPreparation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoInward: Story = {
  render() {
    return <AppendingPreparation />;
  },
};

export const HasInward: Story = {
  render() {
    return <AppendingPreparation inward={issueToIssueModel(randomIssue())} />;
  },
};
