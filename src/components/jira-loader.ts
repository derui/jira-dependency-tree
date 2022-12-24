import isolate from "@cycle/isolate";
import { Reducer } from "@cycle/state";
import xs, { Stream } from "xstream";
import { JiraIssueLoader } from "./jira-issue-loader";
import { JiraSuggestionLoader } from "./jira-suggestions-loader";
import { ComponentSink, ComponentSource } from "./helper";
import { Suggestion } from "@/model/suggestion";
import { Issue } from "@/model/issue";
import { Events } from "@/model/event";

type State = {
  issues: Issue[];
  suggestion?: Suggestion;
};

export interface JiraLoaderSources extends ComponentSource {
  events: Stream<Events>;
}

export interface JiraLoaderSinks extends ComponentSink<"HTTP"> {
  state: Stream<Reducer<State>>;
}

export const JiraLoader = (sources: JiraLoaderSources): JiraLoaderSinks => {
  const issueLoaderSinks = isolate(JiraIssueLoader, { HTTP: "issues" })({
    ...sources,
    events: sources.events.filter((v) => v.kind !== "GetSuggestionRequest"),
  });
  const suggestionLoaderSinks = isolate(JiraSuggestionLoader, { HTTP: "suggestion" })({
    ...sources,
    events: sources.events.filter((v) => v.kind === "GetSuggestionRequest" || v.kind === "GetWholeDataRequest"),
  });

  const initialReducer$ = xs.of(() => {
    return { issues: [], project: undefined, suggestion: undefined };
  });

  const issuesReducer$: Stream<Reducer<State>> = issueLoaderSinks.issues.map(
    (issues): Reducer<State> =>
      (prevState) => {
        if (!prevState) return prevState;

        return { ...prevState, issues };
      },
  );
  const suggestionsReducer$: Stream<Reducer<State>> = suggestionLoaderSinks.suggestion.map(
    (suggestion): Reducer<State> =>
      (prevState) => {
        if (!prevState) return prevState;

        return { ...prevState, suggestion };
      },
  );

  return {
    HTTP: xs.merge(issueLoaderSinks.HTTP, suggestionLoaderSinks.HTTP),
    state: xs.merge(initialReducer$, issuesReducer$, suggestionsReducer$),
  };
};
