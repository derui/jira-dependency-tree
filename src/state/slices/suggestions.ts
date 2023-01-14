import { createSlice } from "@reduxjs/toolkit";
import { requestSuggestion, requestSuggestionFulfilled } from "../actions";
import { mergeSuggestion, Suggestion, suggestionFactory } from "@/model/suggestion";
import { LoaderState, Loading } from "@/type";

interface SuggestionsState {
  suggestions: Suggestion;
  loading: Loading;
}

const initialState = {
  loading: Loading.Completed,
  suggestions: suggestionFactory({}),
} as SuggestionsState satisfies SuggestionsState;

const slice = createSlice({
  name: "suggestions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(requestSuggestion, (state) => {
        state.loading = Loading.Loading;
      })
      .addCase(requestSuggestionFulfilled, (state, action) => {
        state.loading = Loading.Completed;

        state.suggestions = mergeSuggestion(state.suggestions, action.payload);
      });
  },
});

export const getInitialState = slice.getInitialState;
export const reducer = slice.reducer;
