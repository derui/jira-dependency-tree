export interface SuggestedItem {
  id: string;
  value: string;
  displayName: string;
}

export interface Suggestion {
  // suggestions for sprint
  sprints: Record<string, SuggestedItem>;
}

interface SuggestionFactoryArg {
  sprints: Omit<SuggestedItem, "id">[];
}

// create suggestion
export const suggestionFactory = function createSuggestion(args: Partial<SuggestionFactoryArg>): Suggestion {
  const sprints = (args.sprints ?? []).reduce<Record<string, SuggestedItem>>((accum, sprint) => {
    accum[`${sprint.value}`] = {
      ...sprint,
      id: `${sprint.value}`,
    };

    return accum;
  }, {});

  return {
    get sprints() {
      return sprints;
    },
  } as Suggestion;
};

export const mergeSuggestion = (source: Suggestion, other: Suggestion): Suggestion => {
  return {
    sprints: Object.assign({}, source.sprints, other.sprints),
  };
};
