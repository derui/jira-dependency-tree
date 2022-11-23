import { Events } from "@/model/event";
import { Issue } from "@/model/issue";
import { Project } from "@/model/project";
import { Suggestion } from "@/model/suggestion";
import { HTTPSource, RequestInput } from "@cycle/http";
import isolate from "@cycle/isolate";
import { Reducer } from "@cycle/state";
import xs, { Stream } from "xstream";
import { JiraIssueLoader } from "./jira-issue-loader";
import { JiraProjectLoader } from "./jira-project-loader";
import { JiraSuggestionLoader } from "./jira-suggestions-loader";

type State = {
  issues: Issue[];
  project?: Project;
  suggestion?: Suggestion;
};

export type JiraLoaderSources = {
  HTTP: HTTPSource;
  events: Stream<Events>;
};

export type JiraLoaderSinks = {
  state: Stream<Reducer<State>>;
  HTTP: Stream<RequestInput>;
};

export const JiraLoader = function JiraLoader(sources: JiraLoaderSources): JiraLoaderSinks {
  const issueLoaderSinks = isolate(JiraIssueLoader, { HTTP: "issues" })({
    HTTP: sources.HTTP,
    events: sources.events,
  });
  const projectLoaderSinks = isolate(JiraProjectLoader, { HTTP: "project" })({
    HTTP: sources.HTTP,
    events: sources.events.filter((v) => v.kind === "GetWholeDataRequest"),
  });
  const suggestionLoaderSinks = isolate(JiraSuggestionLoader, { HTTP: "suggestion" })({
    HTTP: sources.HTTP,
    events: sources.events.filter((v) => v.kind === "GetSuggestionRequest" || v.kind === "GetWholeDataRequest"),
  });

  const value$ = xs.combine(issueLoaderSinks.issues, projectLoaderSinks.project, suggestionLoaderSinks.suggestion);

  const initialReducer$ = xs.of(() => {
    return { issues: [], project: undefined, suggestion: undefined };
  });

  const reducer$: Stream<Reducer<State>> = value$.map(
    ([issues, project, suggestion]): Reducer<State> =>
      () => {
        return { issues, project, suggestion };
      }
  );

  return {
    HTTP: xs.merge(issueLoaderSinks.HTTP, projectLoaderSinks.HTTP),
    state: xs.merge(initialReducer$, reducer$),
  };
};
