import { jsx } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { ComponentSinks, ComponentSources } from "@/components/type";
import xs, { Stream, MemoryStream } from "xstream";
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

type SuggestorSinks = ComponentSinks<{
  value: Stream<Suggestion>;
}>;

const intent = function intent(sources: SuggestorSources) {
  const openerClicked$ = selectAsMain(sources, ".suggestor__opener").events("click", { bubbles: false }).mapTo(true);
  const termInput$ = selectAsMain(sources, ".suggestor-main__term-input");
  const termInputted$ = termInput$
    .events("input")
    .map((e) => {
      if (!e.target) {
        return undefined;
      }
      return (e.currentTarget as HTMLInputElement).value;
    })
    .filter(filterUndefined);

  const changeSuggestionSelection$ = termInput$
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
  const enterPressed$ = termInput$.events("keypress").filter((e) => e.key === "Enter");

  const suggestionClicked$ = selectAsMain(sources, ".suggestor-suggestions__suggestion")
    .events("click", { bubbles: false })
    .map((e) => (e.target as Element).attributes.getNamedItem("data-id")?.value)
    .filter(filterUndefined);

  return {
    openerClicked$,
    props$: sources.props,
    termInputted$,
    changeSuggestionSelection$,
    suggestionClicked$,
    enterPressed$,
    termInputElement$: termInput$.element(),
  };
};

const effects = function effects(opened$: MemoryStream<boolean>, actions: ReturnType<typeof intent>): Stream<void> {
  return opened$
    .filter((v) => v)
    .map(() => {
      return actions.termInputElement$.map((el) => {
        (el as HTMLInputElement).focus();
      });
    })
    .flatten()
    .startWith(undefined);
};

const model = function model(actions: ReturnType<typeof intent>) {
  const opened$ = xs
    .merge(actions.openerClicked$, actions.suggestionClicked$.mapTo(false), actions.enterPressed$.mapTo(false))
    .fold((accum, open) => {
      if (!open) {
        return false;
      }
      return !accum;
    }, false);
  const originalSuggestions$ = actions.props$.map((v) => v.suggestions);
  const suggestionMap$ = originalSuggestions$.map((suggestions) => {
    const map = new Map<string, [number, Suggestion]>();

    suggestions.forEach((suggestion, index) => {
      map.set(suggestion.id, [index, suggestion]);
    });

    return map;
  });

  const disabled$ = originalSuggestions$.map((v) => v.length === 0);
  const filteredSuggestions$ = xs
    .combine(actions.termInputted$.startWith(""), originalSuggestions$)
    .map(([term, suggestions]) => suggestions.filter((suggestion) => suggestion.label.includes(term)));
  const suggestionsLength$ = filteredSuggestions$.map((v) => v.length);

  const clickedSuggestionIndex$ = actions.suggestionClicked$
    .map((id) => suggestionMap$.map((v) => v.get(id)![0]))
    .flatten();

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
    .combine(
      opened$,
      disabled$,
      filteredSuggestions$,
      xs.merge(selectedSuggestionIndex$, clickedSuggestionIndex$),
      suggestionMap$,
      effects(opened$, actions)
    )
    .map(([opened, disabled, suggestions, index, suggestionMap, effect]) => {
      return { opened, disabled, suggestions, index, suggestionMap, effect, currentSuggestion: suggestions[index] };
    })
    .remember();
};

const view = function view(state$: ReturnType<typeof model>) {
  return state$.map(({ opened, disabled, suggestions, index, currentSuggestion }) => {
    const elements = suggestions.map((obj, cur) => {
      return (
        <li
          class={{ "suggestor-suggestions__suggestion": true, "--selected": cur === index }}
          attrs={{ "data-id": obj.id, "data-testid": "suggestionWrapper" }}
        >
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
          {currentSuggestion?.label ?? ""}
        </button>
        <div class={{ suggestor__main: true, "--opened": opened }} attrs={{ "data-testid": "main" }}>
          <span class={{ "suggestor-main__term": true }}>
            <input
              class={{ "suggestor-main__term-input": true }}
              attrs={{ placeholder: "term", "data-testid": "term", value: "" }}
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

  const value$ = state$
    .map(({ suggestions, index }) => suggestions.at(index))
    .filter(filterUndefined)
    .map((suggestion) => xs.merge(actions.suggestionClicked$, actions.enterPressed$).mapTo(suggestion))
    .flatten();

  return {
    DOM: view(state$),
    value: value$,
  };
};
