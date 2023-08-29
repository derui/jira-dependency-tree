import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { IssueGraphLayouter } from "./issue-graph-layouter";
import { createStore } from "@/state/store";

const meta = {
  title: "Organisms/Issue Graph Layouter",
  component: IssueGraphLayouter,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof IssueGraphLayouter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render() {
    const store = createStore();

    return (
      <Provider store={store}>
        <IssueGraphLayouter />
      </Provider>
    );
  },
};
