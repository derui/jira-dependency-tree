import { test, expect } from "vitest";
import { requestSuggestionAccepted, requestSuggestionFulfilled } from "../actions";
import { getInitialState, reducer } from "./suggestions";
import { Loading, SuggestionKind } from "@/type";
import { mergeSuggestion, suggestionFactory } from "@/model/suggestion";

test("initial state", () => {
  expect(getInitialState()).toEqual({ loading: Loading.Completed, suggestions: suggestionFactory({}) });
});

test("loading", () => {
  const state = reducer(getInitialState(), requestSuggestionAccepted({ kind: SuggestionKind.Sprint, term: "foo" }));

  expect(state).toEqual({ loading: Loading.Loading, suggestions: suggestionFactory({}) });
});

test("store suggestion", () => {
  const suggestion = suggestionFactory({ suggestions: [{ displayName: "name", value: "value" }] });

  const state = reducer(getInitialState(), requestSuggestionFulfilled({ kind: SuggestionKind.Sprint, suggestion }));

  expect(state).toEqual({ loading: Loading.Completed, suggestions: { [SuggestionKind.Sprint]: suggestion } });
});

test("merge suggestion", () => {
  const suggestion = suggestionFactory({ suggestions: [{ displayName: "name", value: "value" }] });
  const nextSuggestion = suggestionFactory({
    suggestions: [
      { displayName: "name", value: "value" },
      { displayName: "foo", value: "bar" },
    ],
  });

  const state = reducer(
    reducer(getInitialState(), requestSuggestionFulfilled({ kind: SuggestionKind.Sprint, suggestion: suggestion })),
    requestSuggestionFulfilled({ kind: SuggestionKind.Sprint, suggestion: nextSuggestion }),
  );

  expect(state).toEqual({
    loading: Loading.Completed,
    suggestions: { [SuggestionKind.Sprint]: mergeSuggestion(suggestion, nextSuggestion) },
  });
});
