import type { Meta, StoryObj } from "@storybook/react";
import { ProjectEditorTop } from "./project-editor-top";

const meta = {
  title: "Molecules/Project Editor Top",
  component: ProjectEditorTop,
  tags: ["autodocs"],
  argTypes: {
    name: { control: "text" },
    projectKey: { control: "text" },
  },
} satisfies Meta<typeof ProjectEditorTop>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const HasKeyAndName: Story = {
  args: {
    name: "Name of project",
    projectKey: "TES",
  },
};
