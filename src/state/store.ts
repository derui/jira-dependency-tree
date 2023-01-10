import { configureStore } from "@reduxjs/toolkit";
import { combineEpics, createEpicMiddleware } from "redux-observable";
import * as apiCredential from "./slices/api-credential";
import * as project from "./slices/project";
import * as issues from "./slices/issues";
import type { Dependencies } from "@/dependencies";
import { DependencyRegistrar } from "@/util/dependency-registrar";

// INJECT REDUCER IMPORT HERE

// INJECT EPIC IMPORT HERE

const reducers = {
  issues: issues.reducer,

  project: project.reducer,

  apiCredential: apiCredential.reducer,
  // do not format this structure.
} as const;

// export type of application state.
export type RootState = typeof reducers;

// eslint-disable-next-line
export const createStore = (registrar: DependencyRegistrar<Dependencies>) => {
  const rootEpic = [
    // do not format this structure.
  ];

  const epicMiddleware = createEpicMiddleware();

  const store = configureStore({
    reducer: reducers,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(epicMiddleware),
  });

  epicMiddleware.run(combineEpics(...rootEpic));

  return store;
};
