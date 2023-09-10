import type { Meta, StoryObj } from "@storybook/react";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { IssueNode } from "./issue-node";
import { LinkNode } from "./link-node";
import { randomIssue } from "@/mock/generators";
import { createStore } from "@/status/store";
import { importIssues } from "@/status/actions";
import { useGraphLayout } from "@/hooks/issue-graph/graph-layout";

const meta = {
  title: "Organisms/Link Node",
  component: LinkNode,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof LinkNode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    layout: {
      pathCommands: "",
      meta: { endIssue: "", startIssue: "" },
    },
  },
  render() {
    const store = createStore();

    store.dispatch(
      importIssues({
        issues: [
          randomIssue({ key: "a", relations: [{ id: "1", inwardIssue: "a", outwardIssue: "b" }] }),
          randomIssue({ key: "b", relations: [{ id: "1", inwardIssue: "a", outwardIssue: "b" }] }),
        ],
      }),
    );

    const Comp = () => {
      const data = useGraphLayout();

      return (
        <svg width="100%" height="100%">
          <IssueNode layout={data.layout.issues[0]} />
          <LinkNode layout={data.layout.links[0]} />
          <IssueNode layout={data.layout.issues[1]} />
        </svg>
      );
    };

    return (
      <Provider store={store}>
        <Comp />
      </Provider>
    );
  },
};
