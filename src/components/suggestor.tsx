import { jsx } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { ComponentSinkBase, ComponentSourceBase } from "@/components/type";
import xs, { Stream, MemoryStream } from "xstream";
import debounce from "xstream/extra/debounce";
import { classes, generateTestId, selectAsMain, TestIdGenerator } from "./helper";
import { filterUndefined } from "@/util/basic";

interface Suggestion<T> {
  id: string;
  label: string;
  value: T;
}

export interface SuggestorProps<T> {
  suggestions: Suggestion<T>[];
}

interface SuggestorSources<T = unknown> extends ComponentSourceBase {
  props: MemoryStream<SuggestorProps<T>>;
}

interface SuggestorSinks<T = unknown> extends ComponentSinkBase {
  value: Stream<T>;
  term: Stream<string>;
}

const intent = function intent<T>(sources: SuggestorSources<T>) {
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

  const suggestionIdClicked$ = selectAsMain(sources, ".suggestor-suggestions__suggestion")
    .events("click", { bubbles: false })
    .map((e) => (e.currentTarget as Element).attributes.getNamedItem("data-id")?.value)
    .filter(filterUndefined);

  return {
    openerClicked$,
    props$: sources.props,
    termInputted$,
    changeSuggestionSelection$,
    suggestionIdClicked$,
    enterPressed$,
    termInputElement$: termInput$.element(),
  };
};

const effects = function effects<T>(
  opened$: MemoryStream<boolean>,
  actions: ReturnType<typeof intent<T>>
): Stream<void> {
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

const model = function model<T>(actions: ReturnType<typeof intent<T>>) {
  return actions.props$
    .map((props) => {
      const opened$ = xs
        .merge(actions.openerClicked$, actions.suggestionIdClicked$.mapTo(false), actions.enterPressed$.mapTo(false))
        .fold((accum, open) => {
          if (!open) {
            return false;
          }
          return !accum;
        }, false);

      const allSuggestions = props.suggestions.sort(({ id: a }, { id: b }) => a.localeCompare(b));
      const suggestionMap = allSuggestions.reduce((accum, suggestion) => {
        accum.set(suggestion.id, suggestion);

        return accum;
      }, new Map<string, Suggestion<T>>());

      const filteredSuggestions$ = actions.termInputted$
        .map((term) => allSuggestions.filter((suggestion) => suggestion.label.toLowerCase().includes(term)))
        .startWith(allSuggestions);
      const suggestionsLength$ = filteredSuggestions$.map((v) => v.length);

      const clickedSuggestionIndex$ = actions.suggestionIdClicked$
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

/**
 * all styles are used by suggestor
 */
const Styles = {
  suggestionNode: classes(
    "flex-none",
    "px-4",
    "py-3",
    "border-l-2",
    "border-l-transparent",
    "cursor-pointer",
    "hover:bg-secondary1-200"
  ),
  suggestionNodeSelected: classes("border-l-secondary1-300"),
  suggestorLabel: classes("flex", "flex-auto", "p-3", "mb-2", "cursor-pointer", "items-center"),
  suggestions: classes("flex", "flex-col", "list-none"),
  termInput: classes(
    "flex",
    "cursor-pointer",
    "color-black",
    "w-192",
    "bg-white",
    "overflow-hidden",
    "text-ellipsis",
    "outline-none",
    "border-none",
    "text-base"
  ),
  term: classes("flex", "items-center", "border-b-1", "border-b-lightgray", "p-3"),
  suggestorMain: classes(
    "hidden",
    "absolute",
    "flex-col",
    "top-full",
    "left-0",
    "bg-white",
    "rounded",
    "shadow-lg",
    "whitespace-nowrap",
    "text-base"
  ),
  suggestorMainOpened: classes("flex"),
  suggestorOpenerIcon: classes("transition-colors", "transition-transform", "hover:bg-complement-400"),
  suggestorOpenerIconOpened: classes("bg-complement-400", "origin-center", "rotate-180"),
  suggestorOpener: classes(
    "px-4",
    "px-3",
    "transition-colors",
    "cursor-pointer",
    "color-black",
    "bg-white",
    "overflow-hidden",
    "text-ellipsis",
    "text-left",
    "border-none",
    "rounded",
    "hover:color-complement-400"
  ),
  suggestorOpenerOpened: classes("color-complement-400"),
  suggestor: classes("inline-block", "relative"),
  suggestorContainer: classes("flex", "flex-row", "content-space-between"),
};

const StyleMaker = {
  suggestionNode: (selected: boolean) => {
    return {
      ...Styles.suggestionNode,
      ...(selected ? Styles.suggestionNodeSelected : {}),
    };
  },
  suggestorMain: (opened: boolean) => {
    return {
      ...Styles.suggestorMain,
      ...(opened ? Styles.suggestorMainOpened : {}),
    };
  },
  suggestorOpenerIcon: (opened: boolean) => {
    return {
      ...Styles.suggestorOpenerIcon,
      ...(opened ? Styles.suggestorOpenerIconOpened : {}),
    };
  },
  suggestorOpener: (opened: boolean) => {
    return {
      ...Styles.suggestorOpener,
      ...(opened ? Styles.suggestorOpenerOpened : {}),
    };
  },
};

const view = function view<T>(state$: ReturnType<typeof model<T>>, gen: TestIdGenerator) {
  return state$.map(({ opened, suggestions, index, currentSuggestion }) => {
    const suggestionNodes = suggestions.map((obj, cur) => {
      const style = StyleMaker.suggestionNode(cur === index);

      return (
        <li class={style} dataset={{ id: obj.id, testid: gen("suggestions") }}>
          <span class={Styles.suggestorLabel} dataset={{ testid: "suggestion" }}>
            {obj.label}
          </span>
        </li>
      );
    });

    const openerStyle = StyleMaker.suggestorOpener(opened);
    const openerIconStyle = StyleMaker.suggestorOpenerIcon(opened);

    return (
      <div class={Styles.suggestor} dataset={{ testid: gen("suggestor-root") }}>
        <span class={Styles.suggestorContainer}>
          <button class={openerStyle} dataset={{ testid: gen("suggestor-opener"), opened: `${opened}` }}>
            {currentSuggestion?.label ?? "Not selected"}
          </button>
          <span class={openerIconStyle}></span>
        </span>
        <div class={StyleMaker.suggestorMain(opened)} dataset={{ testid: gen("search-dialog"), opened: `${opened}` }}>
          <span class={Styles.term}>
            <input class={Styles.termInput} attrs={{ placeholder: "term", "data-testid": gen("term"), value: "" }} />
          </span>
          <ul class={Styles.suggestions}>{suggestionNodes}</ul>
        </div>
      </div>
    );
  });
};

export const Suggestor = <T = unknown,>(sources: SuggestorSources<T>): SuggestorSinks<T> => {
  const actions = intent(sources);
  const state$ = model(actions);

  const submitEvent$ = xs
    .merge(actions.suggestionIdClicked$, actions.enterPressed$)
    .map(() => {
      return state$
        .map(({ suggestions, index }) => suggestions.at(index) ?? undefined)
        .filter(filterUndefined)
        .map<T>((v) => v.value)
        .take(1);
    })
    .flatten();

  const termEvent$ = actions.termInputted$
    .filter((v) => v.length > 0)
    .map((term) =>
      state$
        .filter((v) => v.suggestions.length === 0)
        .mapTo(term)
        .take(1)
    )
    .flatten()
    .compose(debounce(400));

  return {
    DOM: view(state$, generateTestId(sources.testid)),
    value: submitEvent$,
    term: termEvent$,
  };
};
