import { test, expect } from "vitest";
import { requestSuggestionAccepted, requestSuggestionFulfilled } from "../actions";
import { getInitialState, reducer } from "../slices/suggestions";
import { RootState } from "../store";
import * as s from "./suggestion";
import { Loading, SuggestionKind } from "@/type";
import { suggestionFactory } from "@/model/suggestion";

test("get empty suggestion", () => {
  const state = {
    suggestions: getInitialState(),
  } as RootState;

  expect(s.querySuggestion(SuggestionKind.Sprint)(state)).toEqual([Loading.Completed, []]);
});

test("get target kind of selection", () => {
  const state = {
    suggestions: reducer(
      getInitialState(),
      requestSuggestionFulfilled({
        kind: SuggestionKind.Sprint,
        suggestion: suggestionFactory({
          suggestions: [
            { displayName: "Var", value: "foo" },
            { displayName: "foo", value: "bar" },
          ],
        }),
      }),
    ),
  } as RootState;

  expect(s.querySuggestion(SuggestionKind.Sprint)(state)).toEqual([
    Loading.Completed,
    [
      { displayName: "Var", value: "foo", id: "foo" },
      { displayName: "foo", value: "bar", id: "bar" },
    ],
  ]);
});

test("loading", () => {
  const state = {
    suggestions: reducer(getInitialState(), requestSuggestionAccepted({ kind: SuggestionKind.Sprint, term: "var" })),
  } as RootState;

  expect(s.querySuggestion(SuggestionKind.Sprint)(state)).toEqual([Loading.Loading, undefined]);
});
