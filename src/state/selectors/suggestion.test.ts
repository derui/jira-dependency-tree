import test from "ava";
import { requestSuggestion, requestSuggestionAccepted, requestSuggestionFulfilled } from "../actions";
import { getInitialState, reducer } from "../slices/suggestions";
import { RootState } from "../store";
import * as s from "./suggestion";
import { Loading, SuggestionKind } from "@/type";
import { suggestionFactory } from "@/model/suggestion";

test("get empty suggestion", (t) => {
  const state = {
    suggestions: getInitialState(),
  } as RootState;

  t.deepEqual(s.querySuggestion(SuggestionKind.Sprint, "")(state), [Loading.Completed, []]);
});

test("get target kind of selection", (t) => {
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

  t.deepEqual(s.querySuggestion(SuggestionKind.Sprint, "var")(state), [
    Loading.Completed,
    [{ displayName: "Var", value: "foo", id: "foo" }],
  ]);
});

test("loading", (t) => {
  const state = {
    suggestions: reducer(getInitialState(), requestSuggestionAccepted({ kind: SuggestionKind.Sprint, term: "var" })),
  } as RootState;

  t.deepEqual(s.querySuggestion(SuggestionKind.Sprint, "var")(state), [Loading.Loading, undefined]);
});
