import { RequestOptions } from "http";
import { HTTPSource, Response } from "@cycle/http";
import xs, { Stream } from "xstream";
import { Events } from "@/model/event";
import { Project, projectFactory } from "@/model/project";
import { selectResponse } from "@/components/helper";

export type JiraProjectLoaderSources = {
  HTTP: HTTPSource;
  events: Stream<Events>;
};

export type JiraProjectLoaderSinks = {
  HTTP: Stream<RequestOptions>;
  project: Stream<Project>;
};

export const JiraProjectLoader = function JiraProjectLoader(sources: JiraProjectLoaderSources): JiraProjectLoaderSinks {
  const events$ = sources.events.filter((v) => v.kind === "GetWholeDataRequest");
  const request$ = events$.map<RequestOptions>((e) => {
    return {
      url: `${e.env.apiBaseUrl}/load-project`,
      method: "POST",
      type: "application/json",
      headers: {
        "x-api-key": e.env.apiKey,
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

  const project$ = selectResponse(sources.HTTP)
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

const mapResponse = function mapResponse(body: { [k: string]: any }): Project {
  return projectFactory({
    id: body.id,
    key: body.key,
    name: body.name,
    statuses: body.statuses,
    statusCategories: body.statusCategories,
    issueTypes: body.issueTypes,
  });
};
