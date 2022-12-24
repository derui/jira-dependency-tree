import { RequestInput, Response } from "@cycle/http";
import xs, { Stream } from "xstream";
import { ComponentSink, ComponentSource } from "./helper";
import { Events } from "@/model/event";
import { Project, projectFactory } from "@/model/project";
import { httpSourceOf, selectResponse } from "@/components/helper";

export interface JiraProjectLoaderSources extends ComponentSource {
  events: Stream<Events>;
}

export interface JiraProjectLoaderSinks extends ComponentSink<"HTTP"> {
  project: Stream<Project>;
}

export const JiraProjectLoader = (sources: JiraProjectLoaderSources): JiraProjectLoaderSinks => {
  const events$ = sources.events.filter((v) => v.kind === "GetWholeDataRequest");
  const request$ = events$.map<RequestInput>((e) => {
    return {
      url: `${e.credential.apiBaseUrl}/load-project`,
      method: "POST",
      type: "application/json",
      headers: {
        "x-api-key": e.credential.apiKey,
      },
      send: {
        authorization: {
          jira_token: e.credential.token,
          email: e.credential.email,
          user_domain: e.credential.userDomain,
        },
        project: e.projectKey,
      },
    };
  });

  const project$ = selectResponse(httpSourceOf(sources))
    .map((r) => r.replaceError(() => xs.of({ status: 500 } as Response)))
    .flatten()
    .filter((response) => response.status === 200)
    .map((response) => {
      const json = JSON.parse(response.text);

      return mapResponse(json);
    });

  return {
    HTTP: request$,
    project: project$,
  };
};

const mapResponse = (body: { [k: string]: any }): Project => {
  return projectFactory({
    id: body.id,
    key: body.key,
    name: body.name,
    statuses: body.statuses,
    statusCategories: body.statusCategories,
    issueTypes: body.issueTypes,
  });
};
