interface SuggestedItem {
  id: string;
  value: string;
  displayName: string;
}

export interface Suggestion<T = SuggestedItem> {
  // suggestions for sprint
  sprints: T[];
}

// create suggestion
export const suggestionFactory = function createSuggestion(
  args: Partial<Suggestion<Omit<SuggestedItem, "id">>>
): Suggestion {
  const sprints = (args.sprints ?? []).map((sprint, index) => {
    return {
      ...sprint,
      id: `${index}`,
    };
  });

  return {
    get sprints() {
      return sprints;
    },
  } as Suggestion;
};
