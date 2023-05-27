import { test, expect } from "vitest";
import { projects } from "../actions";
import { getInitialState, reducer } from "./projects";
import { Loading } from "@/type";

test("initial state", () => {
  expect(getInitialState()).toEqual({ projects: {}, loading: Loading.Completed });
});

test("state is loading after request", () => {
  const state = reducer(getInitialState(), projects.loadProjects());

  expect(state).toEqual(expect.objectContaining({ loading: Loading.Loading }));
});

test("make projects into record", () => {
  const state = reducer(
    getInitialState(),
    projects.loadProjectsSucceeded({
      projects: [
        { id: "id", key: "key", name: "name" },
        { id: "id2", key: "key2", name: "name2" },
      ],
    }),
  );

  expect(state).toEqual(
    expect.objectContaining({
      projects: {
        id: { id: "id", key: "key", name: "name" },
        id2: { id: "id2", key: "key2", name: "name2" },
      },
      loading: Loading.Completed,
    }),
  );
});
