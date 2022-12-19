import { HTTPSource, RequestOptions, Response } from "@cycle/http";
import xs, { Stream } from "xstream";
import { Events } from "@/model/event";
import { Issue } from "@/model/issue";
import { selectResponse } from "@/components/helper";

export type JiraIssueLoaderSources = {
  HTTP: HTTPSource;
  events: Stream<Events>;
};

export type JiraIssueLoaderSinks = {
  HTTP: Stream<RequestOptions>;
  issues: Stream<Issue[]>;
};

export const JiraIssueLoader = function JiraIssueLoader(sources: JiraIssueLoaderSources): JiraIssueLoaderSinks {
  const events$ = sources.events.filter((v) => v.kind === "GetWholeDataRequest" || v.kind === "SyncIssuesRequest");
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
        condition: eventToCondition(e),
      },
    };
  });

  const issues$ = selectResponse(sources.HTTP)
    .map((r) => r.replaceError(() => xs.of({ status: 500 } as Response)))
    .flatten()
    .filter((response) => response.status === 200)
    .map((response) => {
      return mapResponse(JSON.parse(response.text));
    });

  return {
    HTTP: request$,
    issues: issues$,
  };
};

const mapResponse = function mapResponse(body: { [k: string]: unknown }[]): Issue[] {
  const subtasks = body
    .map((b) => {
      return (b.subtasks as string[]).map((subtask: string) => {
        return { parent: b.key as string, subtask };
      });
    })
    .flat();

  const issues = body.map((b) => {
    return {
      key: b.key as string,
      summary: b.summary as string,
      description: b.description ?? "",
      statusId: b.statusId ?? "",
      typeId: b.typeId ?? "",
      selfUrl: b.selfUrl ?? "",
      outwardIssueKeys: (b.links as { outwardIssue: string }[])
        .filter((v) => !!v.outwardIssue)
        .map((v) => v.outwardIssue),
    } as Issue;
  });

  return mergeTasks(issues, subtasks);
};

const mergeTasks = function mergeTasks(issues: Issue[], subtasks: { parent: string; subtask: string }[]): Issue[] {
  const map = new Map<string, Issue>(issues.map((v) => [v.key, v]));

  for (const { parent, subtask } of subtasks) {
    const accumulatedIssues = map.get(subtask);

    if (accumulatedIssues) {
      const outwardIssues = new Set<string>(accumulatedIssues.outwardIssueKeys);
      if (outwardIssues.has(parent) || outwardIssues.size > 0) {
        continue;
      }
      outwardIssues.add(parent);
      accumulatedIssues.outwardIssueKeys = Array.from(outwardIssues);
    }
  }

  return Array.from(map.values());
};

const eventToCondition = function eventToCondition(e: Events): { sprint?: string; epic?: string } | undefined {
  switch (e.kind) {
    case "SyncIssuesRequest": {
      return {
        sprint: e.condition?.sprint?.value,
        epic: e.condition?.epic,
      };
    }
    default:
      return;
  }
};
