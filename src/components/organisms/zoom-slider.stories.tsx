import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { ZoomSlider } from "./zoom-slider";
import { createStore } from "@/status/store";

const meta = {
  title: "Organisms/Zoom Slider",
  component: ZoomSlider,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof ZoomSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  render() {
    const store = createStore();

    return (
      <Provider store={store}>
        <ZoomSlider />
      </Provider>
    );
  },
};
