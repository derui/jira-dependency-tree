import { Events } from "@/model/event";
import { Issue } from "@/model/issue";
import { Project } from "@/model/project";
import { HTTPSource, RequestInput } from "@cycle/http";
import isolate from "@cycle/isolate";
import { Reducer } from "@cycle/state";
import xs, { Stream } from "xstream";
import { JiraIssueLoader } from "./jira-issue-loader";
import { JiraProjectLoader } from "./jira-project-loader";

type State = {
  issues: Issue[];
  project: Project | undefined;
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

  const value$ = sources.events
    .map((e) => {
      let project$ = xs.of<Project | undefined>(undefined);
      switch (e.kind) {
        case "GetWholeDataRequest":
          project$ = projectLoaderSinks.project.map<Project | undefined>((v) => v);
        default:
          break;
      }

      return xs.combine(issueLoaderSinks.issues, project$);
    })
    .flatten();

  const initialReducer$ = xs.of(() => {
    return { issues: [], project: undefined };
  });

  const reducer$: Stream<Reducer<State>> = value$.map(
    ([issues, project]): Reducer<State> =>
      () => {
        return { issues, project };
      }
  );

  return {
    HTTP: xs.merge(issueLoaderSinks.HTTP, projectLoaderSinks.HTTP),
    state: xs.merge(initialReducer$, reducer$),
  };
};
