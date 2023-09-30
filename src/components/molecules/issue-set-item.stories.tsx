import type { Meta, StoryObj } from "@storybook/react";
import { IssueSetItem } from "./issue-set-item";

const meta = {
  title: "Molecules/Issue Set Item",
  component: IssueSetItem,
  tags: ["autodocs"],
  argTypes: {
    name: { control: "text" },
    selected: { control: "boolean", defaultValue: false },
  },
} satisfies Meta<typeof IssueSetItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "foo",
    onDelete() {},
  },
};
