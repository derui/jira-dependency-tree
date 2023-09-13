import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { IssueGraphContainer } from "./issue-graph";
import { randomIssue } from "@/mock/generators";
import { createStore } from "@/status/store";
import { importIssues } from "@/status/actions";

const meta = {
  title: "Containers/Issue Graph",
  component: IssueGraphContainer,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof IssueGraphContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoInward: Story = {
  render() {
    const store = createStore();

    store.dispatch(
      importIssues({
        issues: [
          randomIssue({ key: "a", relations: [{ id: "1", inwardIssue: "a", outwardIssue: "b" }] }),
          randomIssue({
            key: "b",
            relations: [
              { id: "2", inwardIssue: "b", outwardIssue: "c" },
              { id: "1", inwardIssue: "a", outwardIssue: "b" },
            ],
          }),
          randomIssue({
            key: "c",
            relations: [
              { id: "2", inwardIssue: "b", outwardIssue: "c" },
              { id: "4", inwardIssue: "d", outwardIssue: "c" },
            ],
          }),
          randomIssue({ key: "d", relations: [{ id: "4", inwardIssue: "d", outwardIssue: "c" }] }),
          randomIssue({ key: "e", relations: [{ id: "5", inwardIssue: "e", outwardIssue: "f" }] }),
          randomIssue({ key: "f", relations: [{ id: "5", inwardIssue: "e", outwardIssue: "f" }] }),
        ],
      }),
    );

    return (
      <Provider store={store}>
        {" "}
        <IssueGraphContainer />
      </Provider>
    );
  },
};