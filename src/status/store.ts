import { configureStore } from "@reduxjs/toolkit";
import * as apiCredential from "./slices/api-credential";
import * as issues from "./slices/issues";
import * as zoom from "./slices/zoom";
import * as relations from "./slices/relations";

// INJECT REDUCER IMPORT HERE
import * as graphLayout from "./slices/graph-layout";

import * as relationDelta from "./slices/relation-delta";

// INJECT EPIC IMPORT HERE

const reducers = {
  graphLayout: graphLayout.reducer,

  relationDelta: relationDelta.reducer,

  relations: relations.reducer,

  zoom: zoom.reducer,

  issues: issues.reducer,

  apiCredential: apiCredential.reducer,
  // do not format this structure.
} as const;

/**
 * create pure store. This store does not have any epic/thunk based process. To use for test.
 */
export const createStore = () => {
  return configureStore({ reducer: reducers });
};

// export type of application state.
export type RootState = ReturnType<ReturnType<typeof createStore>["getState"]>;
export type AppDispatch = ReturnType<typeof createStore>["dispatch"];