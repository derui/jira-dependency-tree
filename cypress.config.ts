import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // default location for test server
      config.baseUrl = "http://localhost:8080";
    },
  },
});
