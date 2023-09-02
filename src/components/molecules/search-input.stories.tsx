import type { Meta, StoryObj } from "@storybook/react";
import { SearchInput } from "./search-input";

const meta = {
  title: "Molecules/Search Input",
  component: SearchInput,
  tags: ["autodocs"],
  argTypes: {
    loading: { control: "boolean" },
  },
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: {
    loading: true,
  },
};
