import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { SyncIssueButton } from "./sync-issue-button";
import { createStore } from "@/state/store";
import { submitApiCredentialFulfilled, submitProjectIdFulfilled } from "@/state/actions";
import { projectFactory } from "@/model/project";
import { randomCredential } from "@/mock-data";

const meta = {
  title: "Organisms/Sync issue button",
  component: SyncIssueButton,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof SyncIssueButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render() {
    const store = createStore();

    return (
      <Provider store={store}>
        <div id="dialog-root" />
        <SyncIssueButton />
      </Provider>
    );
  },
};

export const Enabled: Story = {
  render() {
    const store = createStore();
    store.dispatch(submitProjectIdFulfilled(projectFactory({ key: "key", id: "id", name: "name" })));
    store.dispatch(submitApiCredentialFulfilled(randomCredential()));

    return (
      <Provider store={store}>
        <div id="dialog-root" />
        <SyncIssueButton />
      </Provider>
    );
  },
};
