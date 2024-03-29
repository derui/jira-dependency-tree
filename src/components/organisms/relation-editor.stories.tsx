import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { v4 } from "uuid";
import { RelationEditor } from "./relation-editor";
import { createStore } from "@/status/store";
import { randomIssue } from "@/mock/generators";
import { importIssues } from "@/status/actions";
import { RegistrarContext } from "@/registrar-context";
import { createDependencyRegistrar } from "@/utils/dependency-registrar";
import { Dependencies } from "@/dependencies";

const meta = {
  title: "Organisms/Relation Editor",
  component: RelationEditor,
  tags: ["autodocs"],
  argTypes: {
    opened: { control: "boolean" },
  },
} satisfies Meta<typeof RelationEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    opened: false,
  },
  render(args) {
    const store = createStore();
    const issues = [
      randomIssue({ key: "key", relations: [{ id: "id", inwardIssue: "foo", outwardIssue: "key" }] }),
      randomIssue({
        key: "foo",
        relations: [
          { id: "id", inwardIssue: "foo", outwardIssue: "key" },
          { id: "id2", inwardIssue: "bar", outwardIssue: "foo" },
        ],
      }),
      randomIssue({ key: "bar", relations: [{ id: "id2", inwardIssue: "bar", outwardIssue: "foo" }] }),
    ];
    store.dispatch(importIssues({ issues }));

    const registrar = createDependencyRegistrar<Dependencies>();
    registrar.register("generateId", () => v4());

    return (
      <RegistrarContext.Provider value={registrar}>
        <Provider store={store}>
          <div id="panel-root" className="absolute top-0 right-0 w-full h-full -z-1" />
          <RelationEditor {...args} />
        </Provider>
      </RegistrarContext.Provider>
    );
  },
};
