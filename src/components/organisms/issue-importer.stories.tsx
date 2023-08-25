import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { IssueImporter } from "./issue-importer";
import { createPureStore } from "@/state/store";

const meta = {
  title: "Organisms/Issue Importer",
  component: IssueImporter,
  tags: ["autodocs"],
  argTypes: {
    opened: { control: "boolean" },
  },
} satisfies Meta<typeof IssueImporter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    opened: false,
  },
  render(args) {
    const store = createPureStore();

    return (
      <Provider store={store}>
        <IssueImporter {...args} />
      </Provider>
    );
  },
};
