import isolate from "@cycle/isolate";
import { Reducer } from "@cycle/state";
import xs, { Stream } from "xstream";
import { JiraIssueLoader } from "./jira-issue-loader";
import { JiraProjectLoader } from "./jira-project-loader";
import { JiraSuggestionLoader } from "./jira-suggestions-loader";
import { ComponentSink, ComponentSource } from "./helper";
import { Suggestion } from "@/model/suggestion";
import { Project } from "@/model/project";
import { Issue } from "@/model/issue";
import { Events } from "@/model/event";

type State = {
  issues: Issue[];
  project?: Project;
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
  const projectLoaderSinks = isolate(JiraProjectLoader, { HTTP: "project" })({
    ...sources,
    events: sources.events.filter((v) => v.kind === "GetWholeDataRequest"),
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
      }
  );
  const projectReducer$: Stream<Reducer<State>> = projectLoaderSinks.project.map(
    (project): Reducer<State> =>
      (prevState) => {
        if (!prevState) return prevState;

        return { ...prevState, project };
      }
  );
  const suggestionsReducer$: Stream<Reducer<State>> = suggestionLoaderSinks.suggestion.map(
    (suggestion): Reducer<State> =>
      (prevState) => {
        if (!prevState) return prevState;

        return { ...prevState, suggestion };
      }
  );

  return {
    HTTP: xs.merge(issueLoaderSinks.HTTP, projectLoaderSinks.HTTP, suggestionLoaderSinks.HTTP),
    state: xs.merge(initialReducer$, issuesReducer$, projectReducer$, suggestionsReducer$),
  };
};
