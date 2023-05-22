import type { Meta, StoryObj } from "@storybook/react";
import { ProjectInformationEditor } from "./project-information-editor";

const meta = {
  title: "Molecules/Project Information Editor",
  component: ProjectInformationEditor,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof ProjectInformationEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
export const WithSuggestions: Story = {
  args: {
    suggestions: [
      { id: "1", value: "1", displayName: "name1" },
      { id: "2", value: "2", displayName: "name2" },
      { id: "3", value: "3", displayName: "name3" },
    ],
  },

  render(props) {
    return (
      <>
        <div id="dialog-root" className="absolute left-0" />
        <ProjectInformationEditor {...props} />
      </>
    );
  },
};
