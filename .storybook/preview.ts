import type { Preview } from "@storybook/react";
import { setup } from "@twind/core";
import { initialize, mswLoader } from "msw-storybook-addon";

import config from "../src/twind.config.cjs";

setup(config);

initialize();

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "light",
    },
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  loaders: [mswLoader],
};

export default preview;
