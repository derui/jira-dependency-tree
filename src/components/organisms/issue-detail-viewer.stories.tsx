import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { IssueDetailViewer } from "./issue-detail-viewer";
import { randomIssue } from "@/mock/generators";
import { issueToIssueModel } from "@/view-models/issue";
import { createStore } from "@/status/store";

const meta = {
  title: "Organisms/Issue Detail Viewer",
  component: IssueDetailViewer,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof IssueDetailViewer>;

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
      position: { x: 100, y: 400 },
      size: { width: 160, height: 100 },
    },
  },
  render(args) {
    const store = createStore();

    return (
      <Provider store={store}>
        <svg width="500" height="500">
          <IssueDetailViewer {...args} />
        </svg>
      </Provider>
    );
  },
};
