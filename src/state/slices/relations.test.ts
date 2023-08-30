import { test, expect } from "vitest";
import { synchronizeIssuesFulfilled } from "../actions";
import { getInitialState, reducer } from "./relations";
import { randomIssue } from "@/mock-data";

test("initial state", () => {
  expect(getInitialState()).toEqual({ relations: {} });
});

test("fulfill relations", () => {
  const state = reducer(
    getInitialState(),
    synchronizeIssuesFulfilled([
      randomIssue({ key: "a", relations: [{ id: "id", inwardIssue: "b", outwardIssue: "a" }] }),
      randomIssue({ key: "b", relations: [{ id: "id", inwardIssue: "b", outwardIssue: "a" }] }),
    ]),
  );

  expect(state.relations).toEqual({
    id: { id: "id", inwardIssue: "b", outwardIssue: "a" },
  });
});
