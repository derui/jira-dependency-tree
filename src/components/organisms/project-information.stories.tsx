import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { ProjectInformation } from "./project-information";
import { createPureStore } from "@/state/store";
import { projects, submitProjectKey } from "@/state/actions";

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
    store.dispatch(
      projects.loadProjectsSucceeded({
        projects: [
          { id: "id", key: "key", name: "name" },
          { id: "2", key: "key2", name: "name2" },
        ],
      }),
    );

    return (
      <Provider store={store}>
        <div id="dialog-root" />
        <ProjectInformation />
      </Provider>
    );
  },
};

export const Loading: Story = {
  render() {
    const store = createPureStore();
    store.dispatch(submitProjectKey("key"));

    return (
      <Provider store={store}>
        <div id="dialog-root" />
        <ProjectInformation />
      </Provider>
    );
  },
};
