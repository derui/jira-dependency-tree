import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { AppendingPreparation } from "./appending-preparation";
import { randomIssue } from "@/mock/generators";
import { createStore } from "@/status/store";
import { importIssues } from "@/status/actions";

const meta = {
  title: "Organisms/Appending Preparation",
  component: AppendingPreparation,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof AppendingPreparation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render() {
    const store = createStore();
    store.dispatch(
      importIssues({
        issues: [
          randomIssue({ key: "key-1" }),
          randomIssue({ key: "key-2" }),
          randomIssue({ key: "key-3" }),
          randomIssue({ key: "key-4" }),
          randomIssue({ key: "key-5" }),
        ],
      }),
    );

    return (
      <Provider store={store}>
        <AppendingPreparation />
      </Provider>
    );
  },
};
