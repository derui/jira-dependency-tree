import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { UserConfiguration } from "./user-configuration";
import { createPureStore } from "@/state/store";

const meta = {
  title: "Organisms/User Configuration",
  component: UserConfiguration,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof UserConfiguration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render() {
    const store = createPureStore();

    return (
      <Provider store={store}>
        <div id="dialog-root" />
        <div className="right-8 absolute">
          <UserConfiguration />
        </div>
      </Provider>
    );
  },
};
