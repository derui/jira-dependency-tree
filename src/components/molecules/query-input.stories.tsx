import type { Meta, StoryObj } from "@storybook/react";
import { QueryInput } from "./query-input";

const meta = {
  title: "Molecules/Query Input",
  component: QueryInput,
  tags: ["autodocs"],
  argTypes: {
    error: { control: "text" },
    loading: { control: "boolean" },
  },
} satisfies Meta<typeof QueryInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: {
    loading: true,
  },
};
