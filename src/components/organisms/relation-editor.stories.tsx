import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { v4 } from "uuid";
import { RelationEditor } from "./relation-editor";
import { createStore } from "@/state/store";
import { randomIssue } from "@/mock-data";
import { importIssues } from "@/state/actions";
import { RegistrarContext } from "@/registrar-context";
import { createDependencyRegistrar } from "@/util/dependency-registrar";
import { Dependencies } from "@/dependencies";

const meta = {
  title: "Organisms/Relation Editor",
  component: RelationEditor,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof RelationEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render() {
    const store = createStore();
    const issues = [
      randomIssue({ key: "key", relations: [{ id: "id", inwardIssue: "foo", outwardIssue: "key" }] }),
      randomIssue({ key: "foo", relations: [{ id: "id", inwardIssue: "foo", outwardIssue: "key" }] }),
    ];
    store.dispatch(importIssues({ issues }));

    const registrar = createDependencyRegistrar<Dependencies>();
    registrar.register("generateId", () => v4());

    return (
      <RegistrarContext.Provider value={registrar}>
        <Provider store={store}>
          <RelationEditor />
        </Provider>
      </RegistrarContext.Provider>
    );
  },
};
