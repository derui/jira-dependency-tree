import { IssueRequest } from "@/model/event";
import { Project, projectFactory } from "@/model/project";
import { HTTPSource } from "@cycle/http";
import { RequestOptions } from "http";
import xs, { Stream } from "xstream";
import { selectResponse } from "@/components/helper";

export type JiraProjectLoaderSources = {
  HTTP: HTTPSource;
  events: Stream<IssueRequest>;
};

export type JiraProjectLoaderSinks = {
  HTTP: Stream<RequestOptions>;
  project: Stream<Project>;
};

export const JiraProjectLoader = function JiraProjectLoader(sources: JiraProjectLoaderSources): JiraProjectLoaderSinks {
  const events$ = sources.events;
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
    .map((r) =>
      r.replaceError((v) => {
        console.log(v);
        return xs.of();
      })
    )
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
