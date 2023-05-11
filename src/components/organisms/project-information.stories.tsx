import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { ProjectInformation } from "./project-information";
import { createPureStore } from "@/state/store";

const meta = {
  title: "Organisms/Project Information",
  component: ProjectInformation,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof ProjectInformation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render() {
    const store = createPureStore();

    return (
      <Provider store={store}>
        <div id="dialog-root" />
        <ProjectInformation />
      </Provider>
    );
  },
};
