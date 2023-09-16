import type { Meta, StoryObj } from "@storybook/react";

import { OptionProps, Select } from "./select";

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

const Sample = (props: OptionProps) => {
  return <span className="text-primary-400">{props.option.label}</span>;
};

export const Customized: Story = {
  args: {
    options: [
      { label: "label1", value: 1 },
      { label: "label2", value: 2 },
      { label: "label3", value: 3 },
    ],
    components: {
      option: Sample,
    },
  },
};
