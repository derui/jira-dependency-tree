import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { IssueNode } from "./issue-node";
import { randomIssue } from "@/mock/generators";
import { issueToIssueModel } from "@/view-models/issue";
import { createStore } from "@/status/store";
import { importIssues } from "@/status/actions";

const meta = {
  title: "Organisms/Issue Node",
  component: IssueNode,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof IssueNode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    layout: {
      issue: issueToIssueModel(randomIssue()),
      meta: {
        colIndex: 0,
        rowIndex: 0,
      },
      position: { x: 10, y: 20 },
      size: { width: 200, height: 100 },
    },
  },
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
        <svg width="100%" height="100%">
          <IssueNode {...args} />
        </svg>
      </Provider>
    );
  },
};
