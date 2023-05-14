import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { RelationEditor } from "./relation-editor";
import { createPureStore } from "@/state/store";
import { randomIssue, randomProject } from "@/mock-data";
import { selectIssueInGraph, submitProjectKeyFulfilled, synchronizeIssuesFulfilled } from "@/state/actions";

const meta = {
  title: "Organisms/Relation Editor",
  component: RelationEditor,
  tags: ["autodocs"],
  argTypes: {
    kind: { control: "select", options: ["inward", "outward"] },
  },
} satisfies Meta<typeof RelationEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inward: Story = {
  args: {
    kind: "inward",
  },
  render() {
    const store = createPureStore();
    const issues = [
      randomIssue({ key: "key", relations: [{ id: "id", externalId: "id", inwardIssue: "foo", outwardIssue: "key" }] }),
      randomIssue({ key: "foo", relations: [{ id: "id", externalId: "id", inwardIssue: "foo", outwardIssue: "key" }] }),
    ];
    store.dispatch(submitProjectKeyFulfilled(randomProject()));
    store.dispatch(synchronizeIssuesFulfilled(issues));
    store.dispatch(selectIssueInGraph("key"));

    return (
      <Provider store={store}>
        <div id="dialog-root" />
        <RelationEditor kind="inward" />
      </Provider>
    );
  },
};

export const Outward: Story = {
  args: {
    kind: "outward",
  },
  render() {
    const store = createPureStore();

    return (
      <Provider store={store}>
        <div id="dialog-root" />
        <RelationEditor kind="outward" />
      </Provider>
    );
  },
};
