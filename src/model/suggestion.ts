export interface SuggestedItem {
  id: string;
  value: string;
  displayName: string;
}

export interface Suggestion {
  // suggestions for sprint
  [k: string]: SuggestedItem;
}

interface SuggestionFactoryArg {
  suggestions: Omit<SuggestedItem, "id">[];
}

// create suggestion
export const suggestionFactory = function createSuggestion(args: Partial<SuggestionFactoryArg>): Suggestion {
  const suggestions = (args.suggestions ?? []).reduce<Record<string, SuggestedItem>>((accum, sprint) => {
    accum[`${sprint.value}`] = {
      ...sprint,
      id: `${sprint.value}`,
    };

    return accum;
  }, {});

  return suggestions;
};

export const mergeSuggestion = (source: Suggestion, other: Suggestion): Suggestion => {
  return Object.assign({}, source, other);
};
