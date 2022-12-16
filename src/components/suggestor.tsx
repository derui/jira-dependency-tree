import { jsx } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { ComponentSinks, ComponentSources } from "@/components/type";
import xs, { Stream, MemoryStream } from "xstream";
import debounce from "xstream/extra/debounce";
import { generateTestId, selectAsMain, TestIdGenerator } from "./helper";
import { filterUndefined } from "@/util/basic";

interface Suggestion {
  id: string;
  label: string;
  value: unknown;
}

// send term when no have any suggestions.
type SuggestorTermEvent = {
  kind: "term";
  value: string;
};

type SuggestorSubmitEvent = {
  kind: "submit";
  value: unknown;
};

export type SuggestorEvent = SuggestorTermEvent | SuggestorSubmitEvent;

export interface SuggestorProps {
  suggestions: Suggestion[];
}

type SuggestorSources = ComponentSources<{
  props: MemoryStream<SuggestorProps>;
}>;

type SuggestorSinks = ComponentSinks<{
  value: Stream<SuggestorEvent>;
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
      return (e.target as HTMLInputElement).value;
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
    .map((e) => (e.currentTarget as Element).attributes.getNamedItem("data-id")?.value)
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
      return actions.termInputElement$
        .map((el) => {
          (el as HTMLInputElement).focus();
        })
        .take(1);
    })
    .flatten()
    .startWith(undefined);
};

const model = function model(actions: ReturnType<typeof intent>) {
  return actions.props$
    .map((props) => {
      const opened$ = xs
        .merge(actions.openerClicked$, actions.suggestionClicked$.mapTo(false), actions.enterPressed$.mapTo(false))
        .fold((accum, open) => {
          if (!open) {
            return false;
          }
          return !accum;
        }, false);

      const suggestionMap = props.suggestions.reduce((accum, suggestion) => {
        accum.set(suggestion.id, suggestion);

        return accum;
      }, new Map<string, Suggestion>());
      const allSuggestions = Array.from(suggestionMap.values()).sort(({ id: a }, { id: b }) => a.localeCompare(b));

      const filteredSuggestions$ = actions.termInputted$
        .map((term) => allSuggestions.filter((suggestion) => suggestion.label.toLowerCase().includes(term)))
        .startWith(allSuggestions);
      const suggestionsLength$ = filteredSuggestions$.map((v) => v.length);

      const clickedSuggestionIndex$ = actions.suggestionClicked$
        .map((id) => filteredSuggestions$.map((suggestions) => suggestions.findIndex((v) => v.id === id)))
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
          filteredSuggestions$,
          xs.merge(selectedSuggestionIndex$, clickedSuggestionIndex$),
          effects(opened$, actions)
        )
        .map(([opened, suggestions, index, effect]) => {
          return {
            opened,
            suggestions,
            index,
            effect,
            currentSuggestion: index !== -1 ? suggestions[index] : undefined,
          };
        })
        .remember();
    })
    .flatten();
};

const view = function view(state$: ReturnType<typeof model>, gen: TestIdGenerator) {
  return state$.map(({ opened, suggestions, index, currentSuggestion }) => {
    const elements = suggestions.map((obj, cur) => {
      return (
        <li
          class={{ "suggestor-suggestions__suggestion": true, "--selected": cur === index }}
          dataset={{ id: obj.id, testid: gen("suggestions") }}
        >
          <span class={{ "suggestor-suggestions__suggestion-label": true }} dataset={{ testid: "suggestion" }}>
            {obj.label}
          </span>
        </li>
      );
    });

    return (
      <div class={{ suggestor: true }} dataset={{ testid: gen("suggestor-root") }}>
        <span class={{ "suggestor__opener-container": true }}>
          <button class={{ suggestor__opener: true, "--opened": opened }} dataset={{ testid: gen("suggestor-opener") }}>
            {currentSuggestion?.label ?? "Not selected"}
          </button>
          <span class={{ "suggestor__opener-icon": true, "--opened": opened }}></span>
        </span>
        <div class={{ suggestor__main: true, "--opened": opened }} dataset={{ testid: gen("search-dialog") }}>
          <span class={{ "suggestor-main__term": true }}>
            <input
              class={{ "suggestor-main__term-input": true }}
              attrs={{ placeholder: "term", "data-testid": gen("term"), value: "" }}
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

  const submitEvent$ = xs
    .merge(actions.suggestionClicked$, actions.enterPressed$)
    .map(() => {
      return state$
        .map(({ suggestions, index }) => suggestions.at(index) ?? undefined)
        .filter(filterUndefined)
        .map<SuggestorSubmitEvent>((v) => ({ kind: "submit", value: v.value }))
        .take(1);
    })
    .flatten();

  const termEvent$ = actions.termInputted$
    .filter((v) => v.length > 0)
    .map((term) =>
      state$
        .filter((v) => v.suggestions.length === 0)
        .mapTo<SuggestorTermEvent>({ kind: "term", value: term })
        .take(1)
    )
    .flatten()
    .compose(debounce(400));
  return {
    DOM: view(state$, generateTestId(sources.testid)),
    value: xs.merge(submitEvent$, termEvent$),
  };
};
