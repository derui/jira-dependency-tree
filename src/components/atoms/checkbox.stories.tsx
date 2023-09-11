import type { Meta, StoryObj } from "@storybook/react";

import { Checkbox } from "./checkbox";

const meta = {
  title: "Atoms/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  argTypes: {
    checked: { type: "boolean", defaultValue: false },
    disabled: { type: "boolean", defaultValue: false },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {};
export const Checked: Story = {
  args: { checked: true },
};
export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
