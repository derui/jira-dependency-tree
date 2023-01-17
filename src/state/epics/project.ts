import { Epic } from "redux-observable";
import type { Action } from "@reduxjs/toolkit";
import { catchError, filter, switchMap, map } from "rxjs/operators";
import { of } from "rxjs";
import type { RootState } from "../store";
import {
  submitApiCredential,
  submitApiCredentialFulfilled,
  submitProjectKey,
  submitProjectKeyError,
  submitProjectKeyFulfilled,
} from "../actions";
import type { Dependencies } from "@/dependencies";
import { DependencyRegistrar } from "@/util/dependency-registrar";
import { Project, ProjectArgument, projectFactory } from "@/model/project";

type Epics = "loadProject" | "submitCredential";

export const projectEpic = (
  registrar: DependencyRegistrar<Dependencies>,
): Record<Epics, Epic<Action, Action, RootState>> => ({
  loadProject: (action$, state$) =>
    action$.pipe(
      filter(submitProjectKey.match),
      switchMap(({ payload }) => {
        const credential = state$.value.apiCredential.credential;

        if (!credential) {
          return of(submitProjectKeyError());
        }

        return registrar
          .resolve("postJSON")({
            url: `${credential.apiBaseUrl}/load-project`,
            headers: {
              "x-api-key": credential.apiKey,
            },
            body: {
              authorization: {
                jira_token: credential.token,
                email: credential.email,
                user_domain: credential.userDomain,
              },
              project: payload,
            },
          })
          .pipe(
            map((response) => mapResponse(response as { [k: string]: unknown })),
            map((project) => submitProjectKeyFulfilled(project)),
          );
      }),
      catchError((e) => {
        console.error(e);

        return of(submitProjectKeyError());
      }),
    ),

  submitCredential: (action$) =>
    action$.pipe(
      filter(submitApiCredential.match),
      map(({ payload }) => {
        const env = registrar.resolve("env");

        return submitApiCredentialFulfilled({ ...payload, ...env });
      }),
    ),
});

const mapResponse = (body: { [k: string]: unknown }): Project => {
  return projectFactory({
    id: body.id,
    key: body.key,
    name: body.name,
    statuses: body.statuses,
    statusCategories: body.statusCategories,
    issueTypes: body.issueTypes,
  } as ProjectArgument);
};
