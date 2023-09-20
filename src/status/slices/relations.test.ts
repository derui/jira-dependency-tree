import { test, expect } from "vitest";
import { highlightRelatedNodes, importIssues, relations, removeNode } from "../actions";
import { getInitialState, reducer } from "./relations";
import { randomIssue } from "@/mock/generators";

test("initial state", () => {
  expect(getInitialState()).toEqual({ relations: {}, highlightedRelations: {} });
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

test("highlight related relations", () => {
  let state = reducer(
    getInitialState(),
    importIssues({
      issues: [
        randomIssue({ key: "a", relations: [{ id: "1", inwardIssue: "b", outwardIssue: "a" }] }),
        randomIssue({
          key: "b",
          relations: [
            { id: "1", inwardIssue: "b", outwardIssue: "a" },
            { id: "2", inwardIssue: "b", outwardIssue: "c" },
          ],
        }),
        randomIssue({ key: "c", relations: [{ id: "2", inwardIssue: "a", outwardIssue: "c" }] }),
      ],
    }),
  );

  state = reducer(state, highlightRelatedNodes("b"));

  expect(state.highlightedRelations).toEqual({ "1": { id: "1", inwardIssue: "b", outwardIssue: "a" } });
});

test("remove issue from layout", () => {
  let state = reducer(
    getInitialState(),
    importIssues({
      issues: [
        randomIssue({ key: "a", relations: [{ id: "1", inwardIssue: "b", outwardIssue: "a" }] }),
        randomIssue({
          key: "b",
          relations: [
            { id: "1", inwardIssue: "b", outwardIssue: "a" },
            { id: "2", inwardIssue: "b", outwardIssue: "c" },
          ],
        }),
        randomIssue({ key: "c", relations: [{ id: "2", inwardIssue: "b", outwardIssue: "c" }] }),
      ],
    }),
  );
  expect(state.relations).toEqual({
    "1": { id: "1", inwardIssue: "b", outwardIssue: "a" },
    "2": { id: "2", inwardIssue: "b", outwardIssue: "c" },
  });

  state = reducer(state, removeNode("c"));

  expect(state.relations).toEqual({ "1": { id: "1", inwardIssue: "b", outwardIssue: "a" } });
});
