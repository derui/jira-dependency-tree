import { Events, SearchCondition } from "@/model/event";
import { Issue } from "@/model/issue";
import { HTTPSource, RequestOptions } from "@cycle/http";
import xs, { Stream } from "xstream";
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
    .map((r) => r.replaceError(() => xs.of()))
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

const mapResponse = function mapResponse(body: { [k: string]: any }[]): Issue[] {
  const subtasks = body
    .map((b) => {
      return b.subtasks.map((v: any) => {
        return {
          key: v.key,
          summary: v.summary,
          description: v.description,
          statusId: v.statusId ?? "",
          typeId: v.typeId ?? "",
          selfUrl: v.selfUrl ?? "",
          outwardIssueKeys: [b.key],
        };
      });
    })
    .flat();

  const issues = body.map((b) => {
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

  return mergeTasks(subtasks.concat(issues));
};

const mergeTasks = function mergeTasks(issues: Issue[]): Issue[] {
  const map = new Map<string, Issue>();

  for (const issue of issues) {
    const accumulatedIssues = map.get(issue.key);

    if (accumulatedIssues) {
      const outwardIssues = new Set<string>(accumulatedIssues.outwardIssueKeys);

      issue.outwardIssueKeys.forEach((v) => {
        outwardIssues.add(v);
      });

      accumulatedIssues.outwardIssueKeys = Array.from(outwardIssues);
    } else {
      map.set(issue.key, issue);
    }
  }

  return Array.from(map.values());
};

const eventToCondition = function eventToCondition(e: Events): SearchCondition | undefined {
  switch (e.kind) {
    case "SyncIssuesRequest": {
      return {
        sprint: e.condition?.sprint,
        epic: e.condition?.epic,
      };
    }
    default:
      return;
  }
};
