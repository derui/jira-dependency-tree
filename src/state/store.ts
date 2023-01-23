import { Action, configureStore } from "@reduxjs/toolkit";
import { combineEpics, createEpicMiddleware } from "redux-observable";
import * as apiCredential from "./slices/api-credential";
import * as project from "./slices/project";
import * as issues from "./slices/issues";
import * as graphLayout from "./slices/graph-layout";
import * as suggestions from "./slices/suggestions";
import { issueEpic } from "./epics/issue";
import { suggestionEpic } from "./epics/suggestion";
import { projectEpic } from "./epics/project";
import * as zoom from "./slices/zoom";
import { issueGraphEpic } from "./epics/issue-graph";
import * as relationEditor from "./slices/relation-editor";
import { relationEpic } from "./epics/relation";
import type { Dependencies } from "@/dependencies";
import { DependencyRegistrar } from "@/util/dependency-registrar";

// INJECT REDUCER IMPORT HERE

// INJECT EPIC IMPORT HERE

const reducers = {
  relationEditor: relationEditor.reducer,

  zoom: zoom.reducer,

  suggestions: suggestions.reducer,

  graphLayout: graphLayout.reducer,

  issues: issues.reducer,

  project: project.reducer,

  apiCredential: apiCredential.reducer,
  // do not format this structure.
} as const;

// eslint-disable-next-line
export const createStore = (registrar: DependencyRegistrar<Dependencies>) => {
  const rootEpics = [
    ...Object.values(relationEpic(registrar)),

    ...Object.values(issueGraphEpic(registrar)),

    ...Object.values(projectEpic(registrar)),

    ...Object.values(suggestionEpic(registrar)),
    ...Object.values(issueEpic(registrar)),
    // do not format this structure.
  ];

  // eslint-disable-next-line
  const epicMiddleware = createEpicMiddleware<Action, Action, any>();

  const store = configureStore({
    reducer: reducers,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(epicMiddleware),
  });

  epicMiddleware.run(combineEpics<Action, Action, RootState>(...rootEpics));

  return store;
};

/**
 * create pure store. This store does not have any epic/thunk based process. To use for test.
 */
export const createPureStore = () => {
  return configureStore({ reducer: reducers });
};

// export type of application state.
export type RootState = ReturnType<ReturnType<typeof createStore>["getState"]>;
export type AppDispatch = ReturnType<typeof createStore>["dispatch"];
