import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { ProjectSyncOptionEditorForm } from "./project-sync-option-editor-form";
import { createPureStore } from "@/state/store";

const meta = {
  title: "Organisms/Project Sync Option Editor From",
  component: ProjectSyncOptionEditorForm,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof ProjectSyncOptionEditorForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render() {
    const store = createPureStore();

    return (
      <Provider store={store}>
        <div id="dialog-root" />
        <ProjectSyncOptionEditorForm onClose={() => {}} />
      </Provider>
    );
  },
};
