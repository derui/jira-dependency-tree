import { Epic } from "redux-observable";
import type { Action } from "@reduxjs/toolkit";
import { filter, map, of, catchError, mergeMap, tap } from "rxjs";
import type { RootState } from "../store";
import {
  addRelation,
  addRelationAccepted,
  addRelationError,
  addRelationSucceeded,
  removeRelation,
  removeRelationError,
  removeRelationSucceeded,
} from "../actions";
import type { Dependencies } from "@/dependencies";
import { DependencyRegistrar } from "@/util/dependency-registrar";

type Epics = "addRelation" | "addRelationAccepted" | "removeRelation";

export const relationEpic = (
  registrar: DependencyRegistrar<Dependencies>,
): Record<Epics, Epic<Action, Action, RootState>> => ({
  addRelation: (action$) =>
    action$.pipe(
      filter(addRelation.match),
      map((action) =>
        addRelationAccepted({
          relationId: registrar.resolve("generateId")(),
          fromKey: action.payload.fromKey,
          toKey: action.payload.toKey,
        }),
      ),
    ),

  addRelationAccepted: (action$, state$) =>
    action$.pipe(
      filter(addRelationAccepted.match),
      mergeMap((action) => {
        const credential = state$.value.apiCredential.credential;

        if (!credential) {
          return of(addRelationError({ relationId: action.payload.relationId }));
        }

        return registrar
          .resolve("postJSON")({
            url: `${credential.apiBaseUrl}/create-link`,
            headers: {
              "x-api-key": credential.apiKey,
            },
            body: {
              authorization: {
                jira_token: credential.token,
                email: credential.email,
                user_domain: credential.userDomain,
              },
              inward_issue: action.payload.fromKey,
              outward_issue: action.payload.toKey,
            },
          })
          .pipe(
            map((response) =>
              addRelationSucceeded({
                id: action.payload.relationId,
                externalId: (response as Record<string, unknown>).id as string,
                inwardIssue: action.payload.fromKey,
                outwardIssue: action.payload.toKey,
              }),
            ),
            catchError((e) => {
              console.error(e);

              return of(addRelationError(action.payload));
            }),
          );
      }),
    ),

  removeRelation: (action$, state$) =>
    action$.pipe(
      filter(removeRelation.match),
      mergeMap(({ payload }) => {
        const credential = state$.value.apiCredential.credential;
        const relation = state$.value.relationEditor.relations;
        const target = Object.values(relation[payload.fromKey] || {}).find((r) => r.outwardIssue === payload.toKey);

        if (!credential || !target) {
          return of(removeRelationError({ ...payload }));
        }

        return registrar
          .resolve("postJSON")({
            url: `${credential.apiBaseUrl}/delete-link`,
            headers: {
              "x-api-key": credential.apiKey,
            },
            body: {
              authorization: {
                jira_token: credential.token,
                email: credential.email,
                user_domain: credential.userDomain,
              },
              id: target.externalId,
            },
          })
          .pipe(
            tap(console.log),
            map(() => removeRelationSucceeded({ relationId: target.id })),
            catchError((e) => {
              console.error(e);

              return of(removeRelationError({ ...payload }));
            }),
          );
      }),
    ),
});
