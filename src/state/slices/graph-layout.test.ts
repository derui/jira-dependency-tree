import test from "ava";
import { changeToHorizontalLayout, changeToVerticalLayout } from "../actions";
import { getInitialState, reducer } from "./graph-layout";
import { GraphLayout } from "@/issue-graph/type";

test("initial state", (t) => {
  t.deepEqual(getInitialState(), { graphLayout: GraphLayout.Horizontal });
});

test("change to vertical layout", (t) => {
  const state = reducer(getInitialState(), changeToVerticalLayout);

  t.deepEqual(state, { graphLayout: GraphLayout.Vertical });
});

test("change to horizontal layout", (t) => {
  const state = reducer(reducer(getInitialState(), changeToVerticalLayout), changeToHorizontalLayout);

  t.deepEqual(state, { graphLayout: GraphLayout.Horizontal });
});
