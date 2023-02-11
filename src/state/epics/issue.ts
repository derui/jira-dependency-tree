import { Epic } from "redux-observable";
import type { Action } from "@reduxjs/toolkit";
import { catchError, filter, map, switchMap } from "rxjs/operators";
import { of } from "rxjs";
import type { RootState } from "../store";
import { synchronizeIssues, synchronizeIssuesFulfilled } from "../actions";
import type { Dependencies } from "@/dependencies";
import { DependencyRegistrar } from "@/util/dependency-registrar";
import { Issue } from "@/model/issue";
import { IssueKey } from "@/type";

type IssueEpic = "synchronizeIssues";

export const issueEpic = (
  registrar: DependencyRegistrar<Dependencies>,
): Record<IssueEpic, Epic<Action, Action, RootState>> => {
  return {
    synchronizeIssues: (action$, state$) =>
      action$.pipe(
        filter(synchronizeIssues.match),
        switchMap(() => {
          const credential = state$.value.apiCredential.credential;
          const condition = state$.value.project.searchCondition;

          if (!credential) {
            return of(synchronizeIssuesFulfilled([]));
          }

          return registrar
            .resolve("postJSON")({
              url: `${credential.apiBaseUrl}/load-issues`,
              headers: {
                "x-api-key": credential.apiKey,
              },
              body: {
                authorization: {
                  jira_token: credential.token,
                  email: credential.email,
                  user_domain: credential.userDomain,
                },
                project: condition.projectKey,
                condition: {
                  sprint: condition.sprint?.value,
                  epic: condition.epic,
                },
              },
            })
            .pipe(
              map((response) => mapResponse(response as { [k: string]: unknown }[])),
              map((issues) => synchronizeIssuesFulfilled(issues)),
            );
        }),
        catchError((e) => {
          console.error(e);

          return of(synchronizeIssuesFulfilled([]));
        }),
      ),
  };
};

const mapResponse = (body: { [k: string]: unknown }[]): Issue[] => {
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
      relations: (b.links as { inwardIssue: string; id: string; outwardIssue: string }[]).map((v) => ({
        ...v,
        externalId: v.id,
      })),
      subIssues: [] as IssueKey[],
    } as Issue;
  });

  return mergeTasks(issues, subtasks);
};

const mergeTasks = (issues: Issue[], subtasks: { parent: string; subtask: string }[]): Issue[] => {
  const map = new Map<string, Issue>(issues.map((v) => [v.key, v]));

  for (const { parent, subtask } of subtasks) {
    const subtaskRelatedIssue = map.get(subtask);

    if (subtaskRelatedIssue) {
      subtaskRelatedIssue.parentIssue = parent;
    }

    const _parent = map.get(parent);
    if (_parent) {
      _parent.subIssues.push(subtask);
    }
  }

  return Array.from(map.values());
};
