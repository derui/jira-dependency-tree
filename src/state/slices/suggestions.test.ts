import test from "ava";
import { requestSuggestionAccepted, requestSuggestionFulfilled } from "../actions";
import { getInitialState, reducer } from "./suggestions";
import { Loading, SuggestionKind } from "@/type";
import { mergeSuggestion, suggestionFactory } from "@/model/suggestion";

test("initial state", (t) => {
  t.deepEqual(getInitialState(), { loading: Loading.Completed, suggestions: suggestionFactory({}) });
});

test("loading", (t) => {
  const state = reducer(getInitialState(), requestSuggestionAccepted({ kind: SuggestionKind.Sprint, term: "foo" }));

  t.deepEqual(state, { loading: Loading.Loading, suggestions: suggestionFactory({}) });
});

test("store suggestion", (t) => {
  const suggestion = suggestionFactory({ suggestions: [{ displayName: "name", value: "value" }] });

  const state = reducer(getInitialState(), requestSuggestionFulfilled({ kind: SuggestionKind.Sprint, suggestion }));

  t.deepEqual(state, { loading: Loading.Completed, suggestions: { [SuggestionKind.Sprint]: suggestion } });
});

test("merge suggestion", (t) => {
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

  t.deepEqual(state, {
    loading: Loading.Completed,
    suggestions: { [SuggestionKind.Sprint]: mergeSuggestion(suggestion, nextSuggestion) },
  });
});
