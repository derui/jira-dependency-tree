import type { Meta, StoryObj } from "@storybook/react";
import { Panel } from "./panel";

const meta = {
  title: "Molecules/Panel",
  component: Panel,
  tags: ["autodocs"],
  argTypes: {
    opened: { control: "boolean" },
    title: { control: "text" },
  },
} satisfies Meta<typeof Panel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {
  render(args) {
    return (
      <>
        <div id="dialog-root" className="absolute top-0 left-0 w-full h-full -z-1" />
        <Panel {...args}>sample panel</Panel>
      </>
    );
  },
};
