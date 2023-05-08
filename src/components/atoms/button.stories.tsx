import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./button";

const meta = {
  title: "Atoms/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    size: { type: "string", defaultValue: "s" },
    disabled: { type: "boolean", defaultValue: false },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    schema: "primary",
  },
  render(args) {
    return <Button {...args}>Label</Button>;
  },
};

export const Gray: Story = {
  args: {
    schema: "gray",
  },
  render(args) {
    return <Button {...args}>Label</Button>;
  },
};
export const Secondary1: Story = {
  args: {
    schema: "secondary1",
  },
  render(args) {
    return <Button {...args}>Label</Button>;
  },
};
export const Secondary2: Story = {
  args: {
    schema: "secondary2",
  },
  render(args) {
    return <Button {...args}>Label</Button>;
  },
};
