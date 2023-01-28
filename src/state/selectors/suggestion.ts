import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { suggestionFactory } from "@/model/suggestion";
import { Loading, SuggestionKind } from "@/type";

const selectSelf = (state: RootState) => state;

const selectSuggestions = createDraftSafeSelector(selectSelf, (state) => state.suggestions.suggestions);
const selectLoading = createDraftSafeSelector(selectSelf, (state) => state.suggestions.loading);

export const querySuggestion = (kind: SuggestionKind) => {
  return createDraftSafeSelector(selectLoading, selectSuggestions, (loading, suggestions) => {
    if (loading === Loading.Loading) {
      return [loading, undefined] as const;
    }

    const suggestion = suggestions[kind] ?? suggestionFactory({});

    return [loading, Object.values(suggestion)] as const;
  });
};
