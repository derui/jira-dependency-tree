import { configureStore } from "@reduxjs/toolkit";
import * as apiCredential from "./slices/api-credential";
import * as project from "./slices/project";
import * as issues from "./slices/issues";
import * as graphLayout from "./slices/graph-layout";
import * as suggestions from "./slices/suggestions";
import * as zoom from "./slices/zoom";
import * as relations from "./slices/relations";
import * as projects from "./slices/projects";

// INJECT REDUCER IMPORT HERE
import * as relationDelta from "./slices/relation-delta";

// INJECT EPIC IMPORT HERE

const reducers = {
  relationDelta: relationDelta.reducer,

  projects: projects.reducer,

  relations: relations.reducer,

  zoom: zoom.reducer,

  suggestions: suggestions.reducer,

  graphLayout: graphLayout.reducer,

  issues: issues.reducer,

  project: project.reducer,

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
