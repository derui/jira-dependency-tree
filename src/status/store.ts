import { configureStore } from "@reduxjs/toolkit";
import * as apiCredential from "./slices/api-credential";
import * as issues from "./slices/issues";
import * as zoom from "./slices/zoom";
import * as relations from "./slices/relations";

// INJECT REDUCER IMPORT HERE
import * as loading from "./slices/loading";

import * as issueSet from "./slices/issue-set";

import * as graphLayout from "./slices/graph-layout";

import * as relationDelta from "./slices/relation-delta";
import * as attentionIssue from "./slices/attention-issue";
import { createDexieMiddleware } from "./middlewares/dexie";

// INJECT EPIC IMPORT HERE

const reducers = {
  loading: loading.reducer,

  issueSet: issueSet.reducer,

  graphLayout: graphLayout.reducer,

  relationDelta: relationDelta.reducer,

  relations: relations.reducer,

  zoom: zoom.reducer,

  issues: issues.reducer,

  apiCredential: apiCredential.reducer,

  attentionIssue: attentionIssue.reducer,
  // do not format this structure.
} as const;

/**
 * create pure store. This store does not have any epic/thunk based process. To use for test.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createStore = (enabled: boolean = false, initialState: any | undefined = undefined) => {
  return configureStore({
    preloadedState: initialState,
    reducer: reducers,
    middleware: (gDM) => gDM().concat([createDexieMiddleware({ enabled })]),
  });
};

// export type of application state.
export type RootState = ReturnType<ReturnType<typeof createStore>["getState"]>;
export type AppDispatch = ReturnType<typeof createStore>["dispatch"];
