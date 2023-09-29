import type { Meta, StoryObj } from "@storybook/react";
import { Modal } from "./modal";

const meta = {
  title: "Atoms/Modal",
  component: Modal,
  tags: ["autodocs"],
  argTypes: {
    opened: { control: "boolean", defaultValue: false },
    selector: { control: { type: "text" } },
    size: { control: "radio", defaultValue: "m", options: ["s", "m", "l"] },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    opened: false,
    title: "Sample",
  },

  render(args) {
    return (
      <Modal {...args}>
        <div className="border border-b">child element</div>
      </Modal>
    );
  },
};
