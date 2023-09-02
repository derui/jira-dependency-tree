import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { UserConfiguration } from "./user-configuration";
import { createStore } from "@/state/store";
import { createDependencyRegistrar } from "@/util/dependency-registrar";
import { Dependencies } from "@/dependencies";
import { RegistrarContext } from "@/registrar-context";

const meta = {
  title: "Organisms/User Configuration",
  component: UserConfiguration,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof UserConfiguration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render() {
    const store = createStore();
    const registrar = createDependencyRegistrar<Dependencies>();
    registrar.register("env", { apiKey: "key", apiBaseUrl: "url" });

    return (
      <RegistrarContext.Provider value={registrar}>
        <Provider store={store}>
          <div id="dialog-root" className="absolute left-0 top-0" />
          <div className="right-8 absolute">
            <UserConfiguration />
          </div>
        </Provider>
      </RegistrarContext.Provider>
    );
  },
};
