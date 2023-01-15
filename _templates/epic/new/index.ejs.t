---
to: src/state/epics/<%= name %>.ts
---
import { Epic } from "redux-observable";
import type { Action } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import type { Dependencies } from "@/dependencies";
import { DependencyRegistrar } from "@/util/dependency-registrar";

export const issueEpic = (registrar: DependencyRegistrar<Dependencies>): Epic<Action, Action, RootState>[] => [
  // implement epics
];
