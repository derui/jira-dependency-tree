import test from "ava";
import { requestSuggestion, requestSuggestionFulfilled } from "../actions";
import { getInitialState, reducer } from "./suggestions";
import { Loading } from "@/type";
import { mergeSuggestion, suggestionFactory } from "@/model/suggestion";

test("initial state", (t) => {
  t.deepEqual(getInitialState(), { loading: Loading.Completed, suggestions: suggestionFactory({}) });
});

test("loading", (t) => {
  const state = reducer(getInitialState(), requestSuggestion("foo"));

  t.deepEqual(state, { loading: Loading.Loading, suggestions: suggestionFactory({}) });
});

test("store suggestion", (t) => {
  const suggestions = suggestionFactory({ sprints: [{ displayName: "name", value: "value" }] });

  const state = reducer(getInitialState(), requestSuggestionFulfilled(suggestions));

  t.deepEqual(state, { loading: Loading.Completed, suggestions: suggestions });
});

test("merge suggestion", (t) => {
  const suggestions = suggestionFactory({ sprints: [{ displayName: "name", value: "value" }] });
  const nextSuggestions = suggestionFactory({
    sprints: [
      { displayName: "name", value: "value" },
      { displayName: "foo", value: "bar" },
    ],
  });

  const state = reducer(
    reducer(getInitialState(), requestSuggestionFulfilled(suggestions)),
    requestSuggestionFulfilled(nextSuggestions),
  );

  t.deepEqual(state, { loading: Loading.Completed, suggestions: mergeSuggestion(suggestions, nextSuggestions) });
});
