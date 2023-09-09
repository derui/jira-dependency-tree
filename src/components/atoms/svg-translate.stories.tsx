import type { Meta, StoryObj } from "@storybook/react";
import { Translate } from "./svg-translate";

const meta = {
  title: "Atoms/Translate",
  component: Translate,
  tags: ["autodocs"],
  argTypes: {
    x: { control: { type: "number" } },
    y: { control: { type: "number" } },
  },
} satisfies Meta<typeof Translate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  render(args) {
    return (
      <svg width="100%" height="400">
        <Translate {...args}>
          <text height="16">child content</text>
        </Translate>
      </svg>
    );
  },
};
