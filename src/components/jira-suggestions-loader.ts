import { RequestInput, Response } from "@cycle/http";
import xs, { Stream } from "xstream";
import { ApiCredential } from "@/model/event";
import { httpSourceOf, selectResponse, ComponentSink, ComponentSource } from "@/components/helper";
import { suggestionFactory, Suggestion } from "@/model/suggestion";

interface Props {
  request: Stream<{ projectKey: string; term: string; apiCredential: ApiCredential }>;
}

interface Sources extends ComponentSource {
  props: Props;
}

interface Sinks extends ComponentSink<"HTTP"> {
  suggestion: Stream<Suggestion>;
}

export const JiraSuggestionLoader = (sources: Sources): Sinks => {
  const request$ = sources.props.request.map<RequestInput>(({ apiCredential, projectKey, term }) => {
    return {
      url: `${apiCredential.apiBaseUrl}/get-suggestions`,
      method: "POST",
      type: "application/json",
      headers: {
        "x-api-key": apiCredential.apiKey,
      },
      send: {
        authorization: {
          jira_token: apiCredential.token,
          email: apiCredential.email,
          user_domain: apiCredential.userDomain,
        },
        project: projectKey,
        input_value: term,
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
