import type { StorybookConfig } from "@storybook/react-vite";
const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: ["@storybook/addon-controls"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: true,
    defaultName: "Doc",
  },

  staticDirs: [{ from: "../public", to: "/static" }],
};
export default config;
