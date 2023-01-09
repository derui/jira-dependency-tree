import { configureStore } from "@reduxjs/toolkit";
import { combineEpics, createEpicMiddleware } from "redux-observable";
import * as apiCredential from "./state/slices/api-credential";
import * as project from "./state/slices/project";
import type { Dependencies } from "@/dependencies";
import { DependencyRegistrar } from "@/util/dependency-registrar";

// INJECT REDUCER IMPORT HERE

// INJECT EPIC IMPORT HERE

const reducers = {
  project: project.reducer,

  apiCredential: apiCredential.reducer,
  // do not format this structure.
} as const;

// export type of application state.
export type RootState = typeof reducers;

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
