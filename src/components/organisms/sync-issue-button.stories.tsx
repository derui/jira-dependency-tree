import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { SyncIssueButton } from "./sync-issue-button";
import { createPureStore } from "@/state/store";
import { submitApiCredentialFulfilled, submitProjectKeyFulfilled } from "@/state/actions";
import { projectFactory } from "@/model/project";

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
    const store = createPureStore();

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
    const store = createPureStore();
    store.dispatch(submitProjectKeyFulfilled(projectFactory({ key: "key", id: "id", name: "name" })));
    store.dispatch(
      submitApiCredentialFulfilled({
        apiBaseUrl: "url",
        apiKey: "key",
        email: "email",
        token: "token",
        userDomain: "domain",
      }),
    );

    return (
      <Provider store={store}>
        <div id="dialog-root" />
        <SyncIssueButton />
      </Provider>
    );
  },
};