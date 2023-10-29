import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { IssueList } from "./issue-list";
import { createStore } from "@/status/store";
import { importIssues } from "@/status/actions";
import { randomIssue } from "@/mock/generators";

const meta = {
  title: "Organisms/Issue List",
  component: IssueList,
  tags: ["autodocs"],
  argTypes: {
    opened: { control: { type: "boolean" }, defaultValue: false },
  },
} satisfies Meta<typeof IssueList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render(args) {
    const store = createStore();
    store.dispatch(
      importIssues({
        issues: [
          randomIssue({ key: "TES-10", summary: "summary" }),
          randomIssue({ key: "TES-11", summary: "other" }),
          randomIssue({ key: "OTHER-11", summary: "not match" }),
        ],
      }),
    );

    return (
      <Provider store={store}>
        <div id="panel-root" className="absolute top-0 right-0 w-full h-full -z-1" />
        <IssueList {...args} />
      </Provider>
    );
  },
};
