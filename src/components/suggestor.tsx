import { jsx } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { ComponentSinks, ComponentSources } from "@/components/type";
import xs, { MemoryStream } from "xstream";
import { selectAsMain } from "./helper";
import { filterUndefined } from "@/util/basic";

interface Suggestion {
  label: string;
  value: unknown;
}

export interface SuggestorProps {
  suggestions: Suggestion[];
}

type SuggestorSources = ComponentSources<{
  props: MemoryStream<SuggestorProps>;
}>;

type SuggestorSinks = ComponentSinks<{}>;

const intent = function intent(sources: SuggestorSources) {
  const openerClicked$ = selectAsMain(sources, ".suggestor__opener").events("click", { bubbles: false }).mapTo(true);
  const termInputted$ = selectAsMain(sources, ".suggestor-main__term-input")
    .events("input")
    .map((e) => {
      if (!e.currentTarget) {
        return undefined;
      } else {
        return (e.currentTarget as HTMLInputElement).value;
      }
    })
    .filter(filterUndefined);

  return { openerClicked$, props$: sources.props, termInputted$ };
};

const model = function model(actions: ReturnType<typeof intent>) {
  const opened$ = actions.openerClicked$.fold((accum) => !accum, false);
  const suggestions$ = actions.props$.map((v) => v.suggestions);

  return xs.combine(opened$, suggestions$, actions.termInputted$.startWith("")).map(([opened, suggestions, term]) => {
    const filteredSuggestions = suggestions.filter((suggestion) => suggestion.label.includes(term));

    return { opened, disabled: suggestions.length === 0, suggestions: filteredSuggestions };
  });
};

const view = function view(state$: ReturnType<typeof model>) {
  return state$.map(({ opened, disabled, suggestions }) => {
    const elements = suggestions.map((obj) => {
      return (
        <li class={{ "suggestor-suggestions__suggestion": true }}>
          <span class={{ "suggestor-suggestions__suggestion-label": true }}>{obj.label}</span>
        </li>
      );
    });

    return (
      <div class={{ suggestor: true }}>
        <button
          class={{ suggestor__opener: true, "--opened": opened }}
          attrs={{ "data-testid": "opener", disabled: disabled }}
        >
          Open
        </button>
        <div class={{ suggestor__main: true, "--opened": opened }}>
          <span class={{ "suggestor-main__term": true }}>
            <input class={{ "suggestor-main__term-input": true }} attrs={{ placeholder: "term" }} />
          </span>
          <ul class={{ "suggestor-main__suggestions": true }}>{elements}</ul>
        </div>
      </div>
    );
  });
};

export const Suggestor = function Suggestor(sources: SuggestorSources): SuggestorSinks {
  const actions = intent(sources);
  const state$ = model(actions);

  return {
    DOM: view(state$),
  };
};
