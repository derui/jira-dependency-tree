import type { Meta, StoryObj } from "@storybook/react";
import { IssueSetEditor } from "./issue-set-editor";

const meta = {
  title: "Molecules/Issue Set Editor",
  component: IssueSetEditor,
  tags: ["autodocs"],
  argTypes: {
    name: { control: "text" },
  },
} satisfies Meta<typeof IssueSetEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "foo",
    onRename() {},
    onCancel() {},
  },
};
