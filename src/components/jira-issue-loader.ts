import { IssueRequest } from "@/model/event";
import { Issue } from "@/model/issue";
import { HTTPSource } from "@cycle/http";
import { RequestOptions } from "http";
import { MemoryStream, Stream } from "xstream";
import { selectResponse } from "./helper";

export type JiraIssueLoaderSources = {
  HTTP: HTTPSource;
  events: Stream<IssueRequest>;
};

export type JiraIssueLoaderSinks = {
  HTTP: Stream<RequestOptions>;
  issues: MemoryStream<Issue[]>;
};

export const JiraIssueLoader = function JiraIssueLoader(sources: JiraIssueLoaderSources): JiraIssueLoaderSinks {
  const events$ = sources.events;
  const request$ = events$.map<RequestOptions>((e) => {
    return {
      url: `${e.env.apiBaseUrl}/load-issues`,
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

  const issues$ = selectResponse(sources.HTTP)
    .filter((response) => response.status === 200)
    .map((response) => {
      return mapResponse(JSON.parse(response.body));
    });

  return {
    HTTP: request$,
    issues: issues$,
  };
};

const mapResponse = function mapResponse(body: { [k: string]: any }[]): Issue[] {
  return body.map((b) => {
    return {
      key: b.key,
      summary: b.summary,
      description: b.description ?? "",
      statusId: b.statusId ?? "",
      typeId: b.typeId ?? "",
      selfUrl: b.selfUrl ?? "",
      outwardIssueKeys: b.links.filter((v: any) => !!v.outwardIssue).map((v: any) => v.outwardIssue),
    };
  });
};