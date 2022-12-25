import { jsx } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import xs, { Stream, MemoryStream } from "xstream";
import debounce from "xstream/extra/debounce";
import {
  AsNodeStream,
  classes,
  ComponentSource,
  domSourceOf,
  generateTestId,
  mergeNodes,
  portalSourceOf,
  TestIdGenerator,
} from "./helper";
import { Icon, IconProps } from "./atoms/icon";
import { filterUndefined, Rect } from "@/util/basic";
import { ComponentSink } from "@/components/helper";
import { PortalSink } from "@/drivers/portal";

export interface SuggestionItem<T> {
  id: string;
  label: string;
  value: T;
}

export interface SuggestorProps<T> {
  suggestions: SuggestionItem<T>[];
}

interface SuggestorSources<T = unknown> extends ComponentSource {
  props: MemoryStream<SuggestorProps<T>>;
}

interface SuggestorSinks<T = unknown> extends ComponentSink<"Portal">, ComponentSink<"DOM"> {
  value: Stream<T>;
  term: Stream<string>;
}

const intent = <T,>(sources: SuggestorSources<T>) => {
  const openerClicked$ = domSourceOf(sources)
    .select("[data-id=opener]")
    .events("click", { bubbles: false })
    .mapTo(true);
  const termInput$ = portalSourceOf(sources).DOM.select('[data-id="term"]');
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

  const suggestionIdClicked$ = portalSourceOf(sources)
    .DOM.select(".--suggestion")
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
    openerElement$: domSourceOf(sources).select("[data-id=opener]").element(),
    termInputElement$: termInput$.element(),
  };
};

const effects = <T,>(opened$: MemoryStream<boolean>, actions: ReturnType<typeof intent<T>>): Stream<void> => {
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

const model = <T,>(actions: ReturnType<typeof intent<T>>) => {
  const opened$ = xs
    .merge(actions.openerClicked$, actions.suggestionIdClicked$.mapTo(false), actions.enterPressed$.mapTo(false))
    .fold((accum, open) => {
      if (!open) {
        return false;
      }
      return !accum;
    }, false);

  const allSuggestions$ = actions.props$.map((v) => v.suggestions);
  const filteredSuggestions$ = actions.termInputted$
    .map((term) =>
      allSuggestions$.map((suggestions) =>
        suggestions.filter((suggestion) => suggestion.label.toLowerCase().includes(term)),
      ),
    )
    .startWith(allSuggestions$)
    .flatten();
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

  const openAt$ = actions.openerElement$
    .map<Rect | undefined>((v) => {
      const rect = v.getBoundingClientRect();

      return Rect.fromDOMRect(rect);
    })
    .startWith(undefined);

  return xs
    .combine(
      opened$,
      filteredSuggestions$,
      xs.merge(selectedSuggestionIndex$, clickedSuggestionIndex$),
      openAt$,
      effects(opened$, actions),
    )
    .map(([opened, suggestions, index, openAt, effect]) => {
      return {
        opened,
        suggestions,
        index,
        openAt,
        effect,
        currentSuggestion: index !== -1 ? suggestions[index] : undefined,
      };
    })
    .remember();
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
    "hover:bg-secondary1-200",
  ),
  suggestionNodeSelected: classes("border-l-secondary1-300"),
  suggestorLabel: classes("flex", "flex-auto", "cursor-pointer", "items-center"),
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
    "text-base",
  ),
  term: classes("flex", "items-center", "border-b-1", "border-b-lightgray", "p-3"),
  suggestorOpenerOpened: classes("color-complement-400"),
  suggestor: classes("inline-block", "relative"),
  suggestorContainer: classes("flex", "flex-row", "content-between", "items-center"),
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
      ...classes(
        "absolute",
        "flex-col",
        "mt-1",
        "top-full",
        "left-0",
        "bg-white",
        "rounded",
        "shadow-lg",
        "whitespace-nowrap",
        "text-base",
        "w-96",
        "z-50",
      ),
      ...(!opened ? classes("hidden") : {}),
      ...(opened ? classes("flex") : {}),
    };
  },
  suggestorOpenerIcon: (opened: boolean) => {
    return {
      ...classes("transition-colors", "transition-transform"),
      ...(opened ? classes("origin-center", "rotate-180") : {}),
    };
  },
  suggestorOpener: (opened: boolean) => {
    return {
      ...classes(
        "px-4",
        "py-3",
        "transition-colors",
        "cursor-pointer",
        "text-black",
        "bg-white",
        "overflow-hidden",
        "text-ellipsis",
        "text-left",
        "border-none",
        "rounded",
        "hover:text-complement-400",
      ),
      ...(opened ? Styles.suggestorOpenerOpened : {}),
    };
  },
};

const view = <T,>(state$: ReturnType<typeof model<T>>, nodes$: AsNodeStream<["icon"]>, gen: TestIdGenerator) => {
  return xs.combine(state$, nodes$).map(([{ opened, currentSuggestion }, { icon }]) => {
    const openerIconStyle = StyleMaker.suggestorOpenerIcon(opened);

    return (
      <div class={Styles.suggestor} dataset={{ testid: gen("suggestor-root") }}>
        <span class={Styles.suggestorContainer}>
          <button
            class={StyleMaker.suggestorOpener(opened)}
            dataset={{ testid: gen("suggestor-opener"), id: "opener", opened: `${opened}` }}
          >
            {currentSuggestion?.label ?? "Not selected"}
          </button>
          <span class={openerIconStyle}>{icon}</span>
        </span>
      </div>
    );
  });
};

const candidates = <T,>(state$: ReturnType<typeof model<T>>, gen: TestIdGenerator) => {
  return state$.map(({ opened, suggestions, index, openAt }) => {
    const suggestionNodes = suggestions.map((obj, cur) => {
      const style = StyleMaker.suggestionNode(cur === index);

      return (
        <li class={{ ...style, "--suggestion": true }} dataset={{ id: obj.id, testid: gen("suggestion") }}>
          <span class={Styles.suggestorLabel}>{obj.label}</span>
        </li>
      );
    });
    const top = openAt ? `calc(${openAt.top + openAt.height}px)` : "";
    const left = openAt ? `${openAt.left}px` : "";

    return (
      <div
        class={{ ...StyleMaker.suggestorMain(opened), "--opened": opened }}
        style={{ top, left }}
        dataset={{ testid: gen("search-dialog") }}
      >
        <span class={Styles.term}>
          <input
            class={Styles.termInput}
            attrs={{ placeholder: "term", value: "" }}
            dataset={{ testid: gen("term"), id: "term" }}
          />
        </span>
        <ul class={Styles.suggestions}>{suggestionNodes}</ul>
      </div>
    );
  });
};

export const Suggestor = <T = unknown,>(sources: SuggestorSources<T>): SuggestorSinks<T> => {
  const icon = Icon({
    ...sources,
    props: xs.of<IconProps>({
      type: "chevron-down",
      color: "gray",
      size: "m",
    }),
  });

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
        .take(1),
    )
    .flatten()
    .compose(debounce(400));

  return {
    DOM: view(state$, mergeNodes({ icon }), generateTestId(sources.testid)),
    Portal: candidates(state$, generateTestId(sources.testid)).map<PortalSink>((vnode) => {
      return { candidates: vnode };
    }),
    value: submitEvent$,
    term: termEvent$,
  };
};
