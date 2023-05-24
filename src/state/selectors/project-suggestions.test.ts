import { test, expect, describe } from "vitest";
import { projects } from "../actions";
import { createPureStore } from "../store";
import * as s from "./project-suggestions";
import { Loading } from "@/type";

describe("project suggestions", () => {
  test("should return loading when state has loading", () => {
    const store = createPureStore();
    store.dispatch(projects.loadProjects());

    const ret = s.selectProjectSuggestions(store.getState());

    expect(ret).toEqual([Loading.Loading, []]);
  });

  test("should return suggestion items", () => {
    const store = createPureStore();
    store.dispatch(
      projects.loadProjectsSucceeded({
        projects: [
          { id: "2", key: "key1", name: "name2" },
          { id: "1", key: "key", name: "name" },
          { id: "3", key: "key2", name: "name3" },
        ],
      }),
    );

    const ret = s.selectProjectSuggestions(store.getState());

    expect(ret).toEqual([
      Loading.Completed,
      [
        { id: "1", value: "1", displayName: "key | name" },
        { id: "2", value: "2", displayName: "key1 | name2" },
        { id: "3", value: "3", displayName: "key2 | name3" },
      ],
    ]);
  });
});
