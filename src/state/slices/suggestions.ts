import { createSlice } from "@reduxjs/toolkit";
import { requestSuggestionAccepted, requestSuggestionFulfilled } from "../actions";
import { mergeSuggestion, Suggestion } from "@/model/suggestion";
import { Loading, SuggestionKind } from "@/type";

interface SuggestionsState {
  suggestions: Record<SuggestionKind, Suggestion>;
  loading: Loading;
}

const initialState = {
  loading: Loading.Completed,
  suggestions: {},
} as SuggestionsState satisfies SuggestionsState;

const slice = createSlice({
  name: "suggestions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(requestSuggestionAccepted, (state) => {
      state.loading = Loading.Loading;
    });
    builder.addCase(requestSuggestionFulfilled, (state, action) => {
      state.loading = Loading.Completed;

      const suggestion = state.suggestions[action.payload.kind];

      if (suggestion) {
        state.suggestions[action.payload.kind] = mergeSuggestion(suggestion, action.payload.suggestion);
      } else {
        state.suggestions[action.payload.kind] = action.payload.suggestion;
      }
    });
  },
});

export const getInitialState = slice.getInitialState;
export const reducer = slice.reducer;
