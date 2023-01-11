import test from "ava";
import type { RootState } from "../store";
import * as s from "./project";
import { Loading } from "@/type";
import { projectFactory } from "@/model/project";

test("return project if state of loading is not loading", (t) => {
  const state = {
    project: {
      project: projectFactory({ key: "key", id: "id", name: "name" }),
      searchCondition: {},
      loading: Loading.Completed,
    },
  } as RootState;

  const ret = s.queryProject()(state);

  t.deepEqual(ret, [Loading.Completed, state.project.project]);
});

test("do not return project in loading", (t) => {
  const state = {
    project: {
      project: projectFactory({ key: "key", id: "id", name: "name" }),
      searchCondition: {},
      loading: Loading.Loading,
    },
  } as RootState;

  const ret = s.queryProject()(state);

  t.deepEqual(ret, [Loading.Loading, undefined]);
});
