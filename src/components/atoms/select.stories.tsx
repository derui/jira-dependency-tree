import type { Meta, StoryObj } from "@storybook/react";

import { Select } from "./select";

const meta = {
  title: "Atoms/Select",
  component: Select,
  tags: ["autodoc"],
  argTypes: {
    disabled: { type: "boolean", defaultValue: false },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    options: [
      { label: "label1", value: 1 },
      { label: "label2", value: 2 },
      { label: "label3", value: 3 },
    ],
  },
};
