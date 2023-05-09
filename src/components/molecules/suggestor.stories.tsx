import type { Meta, StoryObj } from "@storybook/react";
import { Suggestor } from "./suggestor";

const meta = {
  title: "Molecules/Suggestor",
  component: Suggestor,
  tags: ["autodocs"],
  argTypes: {
    focusOnInit: { control: "boolean" },
    placeholder: { control: "text" },
    suggestions: { control: "object" },
  },
} satisfies Meta<typeof Suggestor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    focusOnInit: false,
    suggestions: [
      {
        id: "1",
        value: "1",
        displayName: "name",
      },
      {
        id: "2",
        value: "2",
        displayName: "name 2",
      },
    ],
  },
  render(args) {
    return (
      <>
        <div id="dialog-root" className="absolute" />
        <Suggestor {...args} />
      </>
    );
  },
};
