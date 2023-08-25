/**
 * definition server that is used by msw
 */
import { rest } from "msw";
import { SetupServer, SetupServerApi, setupServer } from "msw/node";

import { Apis } from "@/apis/api";
import { MOCK_BASE_URL } from "@/mock-data";
import { SecondArg } from "@/util/type-tool";

type Definitions = {
  [k in keyof typeof Apis]?: SecondArg<typeof rest.post>;
};

interface Result {
  listen: () => void;
  close: () => void;
  reset: () => void;
  use: (def: Definitions) => void;
}

/**
 * setup mock server
 */
export const setupMockServer = function setupMockServer(): Result {
  const server = setupServer();

  return {
    listen() {
      server.listen();
    },
    close() {
      server.close();
    },
    reset() {
      server.resetHandlers();
    },
    use(def) {
      server.use(
        rest.post(`${MOCK_BASE_URL}/search-issues`, (req, res, ctx) => {
          if (def.searchIssues) {
            return def.searchIssues(req, res, ctx);
          } else {
            return res();
          }
        }),
        rest.post(`${MOCK_BASE_URL}/get-issues`, (req, res, ctx) => {
          if (def.getIssues) {
            return def.getIssues(req, res, ctx);
          } else {
            return res();
          }
        }),
      );
    },
  };
};
