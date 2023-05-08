import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./input";

const meta = {
  title: "Atoms/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    placeholder: { control: { type: "text" } },
    value: { control: { type: "text" } },
    label: { control: { type: "text" }, defaultValue: "name" },
    focus: { control: "boolean", defaultValue: false },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "test",
    value: "foobar",
  },
};
