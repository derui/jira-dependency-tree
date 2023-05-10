import type { Meta, StoryObj } from "@storybook/react";
import { UserConfigurationForm } from "./user-configuration-form";

const meta = {
  title: "Molecules/User Configuration Form",
  component: UserConfigurationForm,
  tags: ["autodocs"],
  argTypes: {
    initialPayload: { control: "object" },
  },
} satisfies Meta<typeof UserConfigurationForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    initialPayload: {
      userDomain: "",
      token: "",
      email: "",
    },
  },

  render(args) {
    return (
      <>
        <div id="dialog-root" className="absolute" />
        <UserConfigurationForm {...args} />
      </>
    );
  },
};
