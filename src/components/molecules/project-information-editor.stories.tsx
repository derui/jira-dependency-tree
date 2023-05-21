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
