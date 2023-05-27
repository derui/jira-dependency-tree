import { Epic } from "redux-observable";
import type { Action } from "@reduxjs/toolkit";
import { catchError, filter, map, of, startWith, switchMap } from "rxjs";
import type { RootState } from "../store";
import { projects } from "../actions";
import { SimpleProject } from "../models/simple-project";
import type { Dependencies } from "@/dependencies";
import { DependencyRegistrar } from "@/util/dependency-registrar";

type Epics = "loadProjects";

export const projectsEpic = (
  registrar: DependencyRegistrar<Dependencies>,
): Record<Epics, Epic<Action, Action, RootState>> => ({
  loadProjects: (action$, state$) =>
    action$.pipe(
      filter(projects.loadProjects.match),
      switchMap(() => {
        const credential = state$.value.apiCredential.credential;

        if (!credential) {
          return of(projects.loadProjectsError({ reason: "Can not run with no credential" }));
        }

        return registrar
          .resolve("postJSON")({
            url: `${credential.apiBaseUrl}/get-projects`,
            headers: {
              "x-api-key": credential.apiKey,
            },
            body: {
              authorization: {
                jira_token: credential.token,
                email: credential.email,
                user_domain: credential.userDomain,
              },
            },
          })
          .pipe(
            map((response) => mapResponse(response as { values: unknown[] })),
            map((ret) => projects.loadProjectsSucceeded({ projects: ret })),
          );
      }),
      catchError((e, source) => {
        console.error(e);

        return source.pipe(startWith(projects.loadProjectsError({ reason: "failed with exception" })));
      }),
    ),
});

const mapResponse = function mapResponse(response: { values: unknown[] }): SimpleProject[] {
  return response.values.map((res) => {
    const { id, key, name } = res as { id: string; key: string; name: string };

    return { id, key, name };
  });
};
