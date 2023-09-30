import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { IssueSetModal } from "./issue-set-modal";
import { createStore } from "@/status/store";

const meta = {
  title: "Organisms/Issue Set Dialog",
  component: IssueSetModal,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof IssueSetModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render() {
    const store = createStore();

    return (
      <Provider store={store}>
        <IssueSetModal />
      </Provider>
    );
  },
};
