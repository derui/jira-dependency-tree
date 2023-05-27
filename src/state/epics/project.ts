import { Epic } from "redux-observable";
import type { Action } from "@reduxjs/toolkit";
import { catchError, filter, switchMap, map, startWith } from "rxjs/operators";
import { of } from "rxjs";
import type { RootState } from "../store";
import {
  submitApiCredential,
  submitApiCredentialFulfilled,
  submitProjectId,
  submitProjectIdError,
  submitProjectIdFulfilled,
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
      filter(submitProjectId.match),
      switchMap(({ payload }) => {
        const credential = state$.value.apiCredential.credential;
        const projects = state$.value.projects.projects;

        if (!credential) {
          return of(submitProjectIdError());
        }

        const targetProject = projects[payload]?.key;
        if (!targetProject) {
          return of(submitProjectIdError());
        }

        return registrar
          .resolve("postJSON")({
            url: `${credential.apiBaseUrl}/get-project`,
            headers: {
              "x-api-key": credential.apiKey,
            },
            body: {
              authorization: {
                jira_token: credential.token,
                email: credential.email,
                user_domain: credential.userDomain,
              },
              project: targetProject,
            },
          })
          .pipe(
            map((response) => mapResponse(response as { [k: string]: unknown })),
            map((project) => submitProjectIdFulfilled(project)),
          );
      }),
      catchError((e, source) => {
        console.error(e);

        return source.pipe(startWith(submitProjectIdError()));
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
