import type { Meta, StoryObj } from "@storybook/react";
import { ZoomSlider } from "./zoom-slider";

const meta = {
  title: "Molecules/Zoom Slider",
  component: ZoomSlider,
  tags: ["autodocs"],
  argTypes: {
    zoom: { control: "number" },
  },
} satisfies Meta<typeof ZoomSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    zoom: 100,
  },
};
