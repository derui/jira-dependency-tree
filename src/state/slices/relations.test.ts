import { test, expect } from "vitest";
import { importIssues, relations } from "../actions";
import { getInitialState, reducer } from "./relations";
import { randomIssue } from "@/mock-data";

test("initial state", () => {
  expect(getInitialState()).toEqual({ relations: {} });
});

test("fulfill relations", () => {
  const state = reducer(
    getInitialState(),
    importIssues({
      issues: [
        randomIssue({ key: "a", relations: [{ id: "id", inwardIssue: "b", outwardIssue: "a" }] }),
        randomIssue({ key: "b", relations: [{ id: "id", inwardIssue: "b", outwardIssue: "a" }] }),
      ],
    }),
  );

  expect(state.relations).toEqual({
    id: { id: "id", inwardIssue: "b", outwardIssue: "a" },
  });
});

test("reflect results", () => {
  let state = reducer(
    getInitialState(),
    importIssues({
      issues: [
        randomIssue({ key: "a", relations: [{ id: "id", inwardIssue: "b", outwardIssue: "a" }] }),
        randomIssue({ key: "b", relations: [{ id: "id", inwardIssue: "b", outwardIssue: "a" }] }),
      ],
    }),
  );

  const relation = { id: "foo", inwardIssue: "c", outwardIssue: "d" };
  state = reducer(state, relations.reflect({ appended: [relation], removed: ["id"] }));

  expect(state.relations).toEqual({ foo: relation });
});
