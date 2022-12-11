import { Events, GetSuggestionRequest } from "@/model/event";
import { HTTPSource } from "@cycle/http";
import { RequestOptions } from "http";
import xs, { Stream } from "xstream";
import { selectResponse } from "@/components/helper";
import { suggestionFactory, Suggestion } from "@/model/suggestion";

export type JiraSuggestionLoaderSources = {
  HTTP: HTTPSource;
  events: Stream<Events>;
};

export type JiraSuggestionLoaderSinks = {
  HTTP: Stream<RequestOptions>;
  suggestion: Stream<Suggestion>;
};

export const JiraSuggestionLoader = function JiraSuggestionLoader(
  sources: JiraSuggestionLoaderSources
): JiraSuggestionLoaderSinks {
  const events$ = sources.events.filter((v) => v.kind === "GetSuggestionRequest" && v.term.length > 0);
  const request$ = events$.map<RequestOptions>((e) => {
    return {
      url: `${e.env.apiBaseUrl}/get-suggestions`,
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
        input_value: (e as GetSuggestionRequest).term,
      },
    };
  });

  const suggestion$ = selectResponse(sources.HTTP)
    .map((r) => r.replaceError(() => xs.of()))
    .flatten()
    .filter((response) => response.status === 200)
    .map((response) => {
      const json = JSON.parse(response.text);

      return mapResponse(json);
    });

  return {
    HTTP: request$,
    suggestion: suggestion$,
  };
};

const mapResponse = function mapResponse(body: Record<string, unknown>): Suggestion {
  return suggestionFactory({
    sprints: body.sprints as { value: string; displayName: string }[],
  });
};
