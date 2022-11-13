import { jsx } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { ComponentSinks, ComponentSources } from "@/components/type";
import xs, { MemoryStream } from "xstream";
import { selectAsMain } from "./helper";
import { filterUndefined } from "@/util/basic";

interface Suggestion {
  id: string;
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
  const changeSuggestionSelection$ = selectAsMain(sources, ".suggestor-main__term-input")
    .events("keydown")
    .map((e) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          return "down" as const;
        case "ArrowUp":
          e.preventDefault();
          return "up" as const;
        default:
          return undefined;
      }
    })
    .filter(filterUndefined);

  return { openerClicked$, props$: sources.props, termInputted$, changeSuggestionSelection$ };
};

const model = function model(actions: ReturnType<typeof intent>) {
  const opened$ = actions.openerClicked$.fold((accum) => !accum, false);
  const suggestions$ = actions.props$.map((v) => v.suggestions);
  const disabled$ = suggestions$.map((v) => v.length === 0);
  const filteredSuggestions$ = xs
    .combine(actions.termInputted$.startWith(""), suggestions$)
    .map(([term, suggestions]) => suggestions.filter((suggestion) => suggestion.label.includes(term)));
  const suggestionsLength$ = xs.merge(suggestions$, filteredSuggestions$).map((v) => v.length);

  const selectedSuggestionIndex$ = xs
    .combine(actions.changeSuggestionSelection$, suggestionsLength$)
    .fold((index, [move, length]) => {
      switch (move) {
        case "up":
          return Math.max(0, index - 1);
        case "down":
          return Math.min(length - 1, index + 1);
      }
    }, 0);

  return xs
    .combine(opened$, disabled$, filteredSuggestions$, selectedSuggestionIndex$)
    .map(([opened, disabled, suggestions, index]) => {
      return { opened, disabled, suggestions, index };
    });
};

const view = function view(state$: ReturnType<typeof model>) {
  return state$.map(({ opened, disabled, suggestions, index }) => {
    const elements = suggestions.map((obj, cur) => {
      return (
        <li class={{ "suggestor-suggestions__suggestion": true, "--selected": cur === index }}>
          <span class={{ "suggestor-suggestions__suggestion-label": true }} attrs={{ "data-testid": "suggestion" }}>
            {obj.label}
          </span>
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
        <div class={{ suggestor__main: true, "--opened": opened }} attrs={{ "data-testid": "main" }}>
          <span class={{ "suggestor-main__term": true }}>
            <input
              class={{ "suggestor-main__term-input": true }}
              attrs={{ placeholder: "term", "data-testid": "term" }}
            />
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
