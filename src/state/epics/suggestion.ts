import { Epic } from "redux-observable";
import type { Action } from "@reduxjs/toolkit";
import { catchError, debounceTime, filter, map, startWith, switchMap, tap } from "rxjs/operators";
import { of } from "rxjs";
import type { RootState } from "../store";
import {
  requestSuggestion,
  requestSuggestionAccepted,
  requestSuggestionError,
  requestSuggestionFulfilled,
} from "../actions";
import type { Dependencies } from "@/dependencies";
import { DependencyRegistrar } from "@/util/dependency-registrar";
import { Suggestion, suggestionFactory } from "@/model/suggestion";

type Epics = "acceptSuggestion" | "getSuggestion";

export const suggestionEpic = (
  registrar: DependencyRegistrar<Dependencies>,
): Record<Epics, Epic<Action, Action, RootState>> => ({
  getSuggestion: (action$, state$) =>
    action$.pipe(
      filter(requestSuggestionAccepted.match),
      switchMap((action) => {
        const credential = state$.value.apiCredential.credential;
        const projectKey = state$.value.project.project?.key;

        if (!credential || !projectKey) {
          return of(requestSuggestionFulfilled({ kind: action.payload.kind, suggestion: {} }));
        }

        return registrar
          .resolve("postJSON")({
            url: `${credential.apiBaseUrl}/get-suggestions`,
            headers: {
              "x-api-key": credential.apiKey,
            },
            body: {
              authorization: {
                jira_token: credential.token,
                email: credential.email,
                user_domain: credential.userDomain,
              },
              project: projectKey,
              input_value: action.payload.term,
            },
          })
          .pipe(
            map((response) => mapResponse(response as Record<string, unknown>)),
            map((suggestion) => requestSuggestionFulfilled({ kind: action.payload.kind, suggestion })),
          );
      }),
      catchError((e, source) => {
        console.error(e);

        return source.pipe(startWith(requestSuggestionError("Have error")));
      }),
    ),
  acceptSuggestion: (action$) =>
    action$.pipe(
      filter(requestSuggestion.match),
      debounceTime(500),
      map(({ payload }) => requestSuggestionAccepted(payload)),
    ),
});

const mapResponse = function mapResponse(body: Record<string, unknown>): Suggestion {
  return suggestionFactory({
    suggestions: body.sprints as { value: string; displayName: string }[],
  });
};
