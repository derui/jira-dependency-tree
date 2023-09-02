import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { IssueSearcher } from "./issue-searcher";
import { createStore } from "@/state/store";
import { importIssues } from "@/state/actions";
import { randomIssue } from "@/mock-data";

const meta = {
  title: "Organisms/Issue Searcher",
  component: IssueSearcher,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof IssueSearcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render() {
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
        <IssueSearcher />
      </Provider>
    );
  },
};
