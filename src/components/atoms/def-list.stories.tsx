import type { Meta, StoryObj } from "@storybook/react";

import { DefList } from "./def-list";
import { DefItem } from "./def-item";

const meta = {
  title: "Atoms/Def list",
  component: DefList,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof DefList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render(args) {
    return (
      <div className="w-36">
        {" "}
        <DefList>
          <DefItem label="label1">item</DefItem>
          <DefItem label="label2">loooooooooooooooooooooooooooooooooooooooooong item</DefItem>
          <DefItem label="label3">item</DefItem>
        </DefList>
      </div>
    );
  },
};
