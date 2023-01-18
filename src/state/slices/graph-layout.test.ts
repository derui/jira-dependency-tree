import { test, expect } from "vitest";
import { changeToHorizontalLayout, changeToVerticalLayout } from "../actions";
import { getInitialState, reducer } from "./graph-layout";
import { GraphLayout } from "@/issue-graph/type";

test("initial state", () => {
  expect(getInitialState()).toEqual({ graphLayout: GraphLayout.Horizontal });
});

test("change to vertical layout", () => {
  const state = reducer(getInitialState(), changeToVerticalLayout);

  expect(state).toEqual({ graphLayout: GraphLayout.Vertical });
});

test("change to horizontal layout", () => {
  const state = reducer(reducer(getInitialState(), changeToVerticalLayout), changeToHorizontalLayout);

  expect(state).toEqual({ graphLayout: GraphLayout.Horizontal });
});
