import { RequestInput, Response } from "@cycle/http";
import xs, { Stream } from "xstream";
import { Events, GetSuggestionRequest } from "@/model/event";
import { httpSourceOf, selectResponse, ComponentSink, ComponentSource } from "@/components/helper";
import { suggestionFactory, Suggestion } from "@/model/suggestion";

export interface JiraSuggestionLoaderSources extends ComponentSource {
  events: Stream<Events>;
}

export interface JiraSuggestionLoaderSinks extends ComponentSink<"HTTP"> {
  suggestion: Stream<Suggestion>;
}

export const JiraSuggestionLoader = function JiraSuggestionLoader(
  sources: JiraSuggestionLoaderSources
): JiraSuggestionLoaderSinks {
  const events$ = sources.events.filter((v) => v.kind === "GetSuggestionRequest" && v.term.length > 0);
  const request$ = events$.map<RequestInput>((e) => {
    return {
      url: `${e.credential.apiBaseUrl}/get-suggestions`,
      method: "POST",
      type: "application/json",
      headers: {
        "x-api-key": e.credential.apiKey,
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

  const suggestion$ = selectResponse(httpSourceOf(sources))
    .map((r) => r.replaceError(() => xs.of({ status: 500 } as Response)))
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
