import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { rest } from "msw";
import { IssueImporter } from "./issue-importer";
import { createStore } from "@/state/store";
import { MOCK_BASE_URL, randomCredential } from "@/mock-data";
import { submitApiCredentialFulfilled } from "@/state/actions";

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
    const store = createStore();

    return (
      <Provider store={store}>
        <IssueImporter {...args} />
      </Provider>
    );
  },
};

export const Loading: Story = {
  args: {
    opened: true,
  },

  parameters: {
    msw: {
      handlers: [
        rest.post(`${MOCK_BASE_URL}/search-issues`, (_, res, ctx) => {
          return res(ctx.delay("infinite"));
        }),
      ],
    },
  },
  render(args) {
    const store = createStore();
    store.dispatch(submitApiCredentialFulfilled(randomCredential()));

    return (
      <Provider store={store}>
        <IssueImporter {...args} />
      </Provider>
    );
  },
};

export const Error: Story = {
  args: {
    opened: false,
  },
  parameters: {
    msw: {
      handlers: [
        rest.post(`${MOCK_BASE_URL}/search-issues`, (_, res, ctx) => {
          return res(ctx.delay(800), ctx.status(400), ctx.json({ message: "invalid syntax" }));
        }),
      ],
    },
  },
  render(args) {
    const store = createStore();
    store.dispatch(submitApiCredentialFulfilled(randomCredential()));

    return (
      <Provider store={store}>
        <IssueImporter {...args} />
      </Provider>
    );
  },
};
export const DisplayIssues: Story = {
  args: {
    opened: true,
  },
  parameters: {
    msw: {
      handlers: [
        rest.post(`${MOCK_BASE_URL}/search-issues`, (_, res, ctx) => {
          return res(
            ctx.delay(300),
            ctx.json({
              issues: [
                {
                  key: "key",
                  summary: "summary",
                  status: {
                    id: "",
                    name: "name",
                    statusCategory: "TODO",
                  },
                  type: {
                    id: "",
                    name: "name",
                  },
                  links: [],
                  subtasks: [],
                },
              ],
            }),
          );
        }),
      ],
    },
  },
  render(args) {
    const store = createStore();
    store.dispatch(submitApiCredentialFulfilled(randomCredential()));

    return (
      <Provider store={store}>
        <IssueImporter {...args} />
      </Provider>
    );
  },
};
