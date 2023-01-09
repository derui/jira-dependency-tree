import { configureStore } from "@reduxjs/toolkit";
import { combineEpics, createEpicMiddleware, Epic } from "redux-observable";
import type { Dependencies } from "@/dependencies";
import { DependencyRegistrar } from "@/util/dependency-registrar";

// INJECT REDUCER IMPORT HERE
// INJECT EPIC IMPORT HERE

const reducers = {
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
