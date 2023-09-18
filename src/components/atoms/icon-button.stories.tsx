import type { Meta, StoryObj } from "@storybook/react";

import { ColorSchema } from "../type";
import { IconButton } from "./icon-button";
import { Search } from "./icons";

const meta = {
  title: "Atoms/Icon Button",
  component: IconButton,
  tags: ["autodocs"],
  argTypes: {
    color: { control: "select", defaultValue: "gray", options: Object.keys(ColorSchema) },
    size: { type: "string", defaultValue: "s" },
    disabled: { type: "boolean", defaultValue: false },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Icon: Story = {
  args: {
    color: "gray",
  },
  render(args) {
    return (
      <IconButton {...args}>
        <Search color={args.color} size={args.size} />
      </IconButton>
    );
  },
};
