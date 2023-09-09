import type { Meta, StoryObj } from "@storybook/react";
import { Dialog } from "./dialog";
import { Rect } from "@/utils/basic";

const meta = {
  title: "Atoms/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  argTypes: {
    opened: { control: "boolean", defaultValue: false },
    margin: { control: "select", options: ["all", "left"] },
    aligned: { control: "select", options: ["bottomLeft", "bottomRight"], defaultValue: "bottomLeft" },
    parentRect: {
      control: "object",
      defaultValue: new Rect({ bottom: 10, top: 0, left: 10, right: 20 }),
    },
    selector: { control: { type: "text" } },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    aligned: "bottomLeft",
    opened: false,
    parentRect: new Rect({ bottom: 10, top: 0, left: 10, right: 20 }),
  },

  render(args) {
    return (
      <>
        <div id="dialog-root" className="w-10 h-10"></div>
        <Dialog {...args}>
          <span className="border border-b">child element</span>
        </Dialog>
      </>
    );
  },
};
