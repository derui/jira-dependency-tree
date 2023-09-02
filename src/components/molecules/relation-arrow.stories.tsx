import type { Meta, StoryObj } from "@storybook/react";
import { RelationArrow } from "./relation-arrow";

const meta = {
  title: "Molecules/Relation Arrow",
  component: RelationArrow,
  tags: ["autodocs"],
  argTypes: {
    draft: { control: "boolean" },
  },
} satisfies Meta<typeof RelationArrow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render() {
    return (
      <ul>
        <RelationArrow />
      </ul>
    );
  },
};

export const Draft: Story = {
  render() {
    return (
      <ul>
        <RelationArrow draft />
      </ul>
    );
  },
};

export const Deletable: Story = {
  render() {
    return (
      <ul>
        <RelationArrow onClick={() => {}} />
      </ul>
    );
  },
};
