import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // default location for test server
    baseUrl: "http://localhost:8080",
    setupNodeEvents(on, config) {},
  },
});
