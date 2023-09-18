import type { Meta, StoryObj } from "@storybook/react";
import { Icon, IconType } from "./icons";

const meta = {
  title: "Atoms/Icons",
  tags: ["autodocs"],
  component: Icon,
  argTypes: {
    iconType: { control: "select", options: Object.keys(IconType) },
    size: { control: "radio", defaultValue: "m", options: ["s", "m", "l"] },
    color: { control: "select", options: ["gray", "primary", "secondary1", "secondary2", "complement"] },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    iconType: "x",
  },
  render(args) {
    return <Icon {...args} />;
  },
};
