import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { GraphUnroller } from "./graph-unroller";
import { createStore } from "@/state/store";
import { expandIssue, importIssues } from "@/state/actions";
import { randomIssue } from "@/mock-data";

const meta = {
  title: "Organisms/Graph Unroller",
  component: GraphUnroller,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof GraphUnroller>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render() {
    const store = createStore();

    return (
      <Provider store={store}>
        <GraphUnroller />
      </Provider>
    );
  },
};

export const Active: Story = {
  render() {
    const store = createStore();
    store.dispatch(importIssues({ issues: [randomIssue({ key: "key" })] }));
    store.dispatch(expandIssue("key"));

    return (
      <Provider store={store}>
        <GraphUnroller />
      </Provider>
    );
  },
};
