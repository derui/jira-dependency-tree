import { jsx } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { Reducer, StateSource } from "@cycle/state";
import xs, { Stream } from "xstream";
import produce from "immer";
import isolate from "@cycle/isolate";
import {
  ComponentSource,
  AsNodeStream,
  classes,
  generateTestId,
  mergeNodes,
  TestIdGenerator,
  ComponentSink,
  simpleReduce,
  portalSourceOf,
} from "./helper";
import { SuggestionItem, Suggestor, SuggestorProps } from "./suggestor";
import { Icon, IconProps } from "./atoms/icon";
import { Input, InputProps } from "./atoms/input";
import { JiraSuggestionLoader } from "./jira-suggestions-loader";
import { ApiCredential, SearchCondition } from "@/model/event";
import { SuggestedItem, Suggestion } from "@/model/suggestion";
import { filterUndefined, Rect } from "@/util/basic";
import { PortalSink } from "@/drivers/portal";

const ConditionType = {
  Default: "default",
  Sprint: "sprint",
  Epic: "epic",
} as const;

type ConditionType = typeof ConditionType[keyof typeof ConditionType];

export interface State {
  conditionType: ConditionType;
  currentSearchCondition: SearchCondition | undefined;
  lastTerm: string | undefined;
  apiCredential?: ApiCredential;
  projectKey?: string;
  suggestions: SuggestionItem<SuggestedItem>[];
  openAt?: Rect;
  opened: boolean;
}

interface Props {
  apiCredential: Stream<ApiCredential>;
  projectKey: Stream<string>;
  openAt: Stream<Rect>;
}

interface Sources extends ComponentSource {
  props: Props;
  state: StateSource<State>;
}

interface Sinks extends ComponentSink<"Portal">, ComponentSink<"HTTP"> {
  state: Stream<Reducer<State>>;
  value: Stream<SearchCondition>;
  cancel: Stream<unknown>;
}

const intent = (sources: Sources) => {
  const typeChanged$ = portalSourceOf(sources)
    .DOM.select("select")
    .events("input")
    .map((event) => {
      return (event.target as HTMLSelectElement).value as ConditionType;
    });
  const cancel$ = portalSourceOf(sources).DOM.select("[data-id=cancel]").events("click").mapTo(false);
  const submit$ = portalSourceOf(sources).DOM.select("[data-id=submit]").events("click").mapTo(false);

  return {
    typeChanged$,
    cancel$,
    submit$,
  };
};

const Styles = {
  searchConditionEditorContainer: (opened: boolean) => {
    return {
      ...classes(
        "absolute",
        "flex",
        "flex-col",
        "left-0",
        "top-full",
        "mt-6",
        "bg-white",
        "rounded",
        "shadow-lg",
        "transition-width",
        "overflow-hidden",
      ),
      ...(opened ? classes("w-96", "visible") : {}),
      ...(!opened ? classes("w-0", "visible", "overflow-hidden") : {}),
    };
  },
  header: classes(
    "border-b-2",
    "border-b-secondary1-200",
    "text-secondary1-500",
    "text-lg",
    "text-bold",
    "p-3",
    "whitespace-nowrap",
  ),
  selection: classes("flex-auto", "p-2"),
  baseForm: classes("flex", "flex-row", "p-3", "items-center"),
  controlButton: classes("flex-none", "first:ml-0", "last:mr-0", "mx-1", "cursor-pointer"),
  sprintSuggestor: (opened: boolean) => {
    return {
      ...(!opened ? classes("hidden") : {}),
    };
  },
  epicInput: (opened: boolean) => {
    return {
      ...classes("p-2", "pt-0"),
      ...(!opened ? classes("hidden") : {}),
    };
  },
};

const view = (
  state$: Stream<State>,
  nodes$: AsNodeStream<["cancel", "submit", "epicInput", "suggestor"]>,
  gen: TestIdGenerator,
) => {
  return xs.combine(state$, nodes$).map(([{ opened, conditionType, openAt }, nodes]) => {
    const top = openAt ? `calc(${openAt.top + openAt.height}px)` : "";
    const left = openAt ? `${openAt.left}px` : "";

    return (
      <div
        class={Styles.searchConditionEditorContainer(opened)}
        style={{ top, left }}
        dataset={{ testid: gen("selector") }}
      >
        <h2 class={Styles.header}>Select method to synchronize issues</h2>
        <div class={Styles.baseForm}>
          <select class={Styles.selection} dataset={{ testid: gen("condition-type") }}>
            <option attrs={{ value: ConditionType.Default }}>Use Current Sprint</option>
            <option attrs={{ value: ConditionType.Sprint }}>Select Sprint</option>
            <option attrs={{ value: ConditionType.Epic }}>Select Epic</option>
          </select>
          <span class={Styles.controlButton} dataset={{ id: "cancel" }}>
            {nodes.cancel}
          </span>
          <span class={Styles.controlButton} dataset={{ id: "submit" }}>
            {nodes.submit}
          </span>
        </div>
        <div class={Styles.sprintSuggestor(conditionType === ConditionType.Sprint)}>{nodes.suggestor}</div>
        <div class={Styles.epicInput(conditionType === ConditionType.Epic)}>{nodes.epicInput}</div>
      </div>
    );
  });
};

export const ProjectSyncOptionEditorDialog = (sources: Sources): Sinks => {
  const loader = isolate(
    JiraSuggestionLoader,
    "jiraSuggestionLoader",
  )({
    ...sources,
    props: {
      request: sources.state.stream
        .map(({ apiCredential, projectKey, lastTerm }) => {
          if (!projectKey || !lastTerm || !apiCredential) {
            return xs.never();
          }

          return xs.of({ projectKey, term: lastTerm, apiCredential });
        })
        .flatten()
        .take(1),
    },
  });

  const suggestor = isolate(
    Suggestor,
    "suggestor",
  )({
    ...sources,
    DOM: portalSourceOf(sources).DOM,
    props: sources.state
      .select<State["suggestions"]>("suggestions")
      .stream.map<SuggestorProps<SuggestedItem>>((suggestions) => {
        return {
          suggestions,
        };
      }),
    testid: "sprint-suggestor",
  });

  const cancelIcon = Icon({
    DOM: portalSourceOf(sources).DOM,
    props: xs.of<IconProps>({
      type: "circle-x",
      color: "gray",
      size: "m",
    }),
  });

  const submitIcon = Icon({
    DOM: portalSourceOf(sources).DOM,
    props: xs.of<IconProps>({
      type: "circle-check",
      color: "complement",
      size: "m",
    }),
  });

  const epicInput = isolate(
    Input,
    "nameInput",
  )({
    DOM: portalSourceOf(sources).DOM,
    props: xs.of<InputProps>({
      value: "",
      placeholder: "e.g. TES-105",
    }),
  });

  const actions = intent(sources);

  const initialReducer$ = xs.of<Reducer<State>>(() => {
    return {
      conditionType: "default",
      currentSearchCondition: undefined,
      lastTerm: undefined,
      suggestions: [],
      opened: false,
    };
  });

  const apiCredentialReducer$ = sources.props.apiCredential.map(
    simpleReduce<State, ApiCredential>((draft, apiCredential) => {
      draft.apiCredential = apiCredential;
    }),
  );

  const projectKeyReducer$ = sources.props.projectKey.map(
    simpleReduce<State, string>((draft, projectKey) => {
      draft.projectKey = projectKey;
    }),
  );

  const openAtReducer$ = sources.props.openAt.map(
    simpleReduce<State, Rect>((draft, openAt) => {
      draft.openAt = openAt;
      draft.opened = true;
    }),
  );

  const openerReducer$ = xs.merge(actions.cancel$, actions.submit$).map(
    simpleReduce<State, unknown>((draft) => {
      draft.opened = false;
    }),
  );

  const changeReducer$ = actions.typeChanged$.map<Reducer<State>>((conditionType) => {
    return (prevState?: State) => {
      if (!prevState) return undefined;

      return produce(prevState, (draft) => {
        draft.conditionType = conditionType;

        if (conditionType === "default" && draft.projectKey) {
          draft.currentSearchCondition = { projectKey: draft.projectKey };
        }
      });
    };
  });

  const termReducer$ = suggestor.term.map<Reducer<State>>((lastTerm) => {
    return (prevState?: State) => {
      if (!prevState) return undefined;

      return produce(prevState, (draft) => {
        draft.lastTerm = lastTerm;
      });
    };
  });

  const epicConditionReducer$ = epicInput.input.map(
    simpleReduce<State, string>((draft, epic) => {
      if (draft.projectKey && draft.conditionType === "epic") {
        draft.currentSearchCondition = { projectKey: draft.projectKey, epic };
      }
    }),
  );

  const sprintConditionReducer$ = suggestor.value.map(
    simpleReduce<State, SuggestedItem>((draft, item) => {
      if (draft.projectKey && draft.conditionType === "sprint") {
        draft.currentSearchCondition = { projectKey: draft.projectKey, sprint: item };
      }
      draft.lastTerm = undefined;
    }),
  );

  const suggestionReducer$ = loader.suggestion.map(
    simpleReduce<State, Suggestion>((draft, suggestion) => {
      const currentSuggestions = new Set(draft.suggestions.map((v) => v.id));
      const suggestions = suggestion.sprints.map((item) => ({ id: item.id, label: item.displayName, value: item }));

      const current = Array.from(draft.suggestions);

      for (const suggestion of suggestions) {
        if (currentSuggestions.has(suggestion.id)) {
          continue;
        }

        current.push(suggestion);
      }

      draft.suggestions = current;
    }),
  );

  const view$ = view(
    sources.state.stream,
    mergeNodes({
      cancel: cancelIcon,
      submit: submitIcon,
      epicInput,
      suggestor,
    }),
    generateTestId(sources.testid),
  );

  return {
    HTTP: xs.merge(loader.HTTP),
    Portal: xs.combine(suggestor.Portal, view$).map<PortalSink>(([suggestor, root]) => {
      return {
        ...suggestor,
        roo: root,
      };
    }),
    state: xs.merge(
      initialReducer$,
      openerReducer$,
      changeReducer$,
      termReducer$,
      epicConditionReducer$,
      sprintConditionReducer$,
      openAtReducer$,
      apiCredentialReducer$,
      projectKeyReducer$,
      suggestionReducer$,
    ),
    cancel: actions.cancel$.map<unknown>((v) => v),
    value: sources.state
      .select<State["currentSearchCondition"]>("currentSearchCondition")
      .stream.filter(filterUndefined)
      .map((v) => {
        return actions.submit$.take(1).mapTo(v);
      })
      .flatten(),
  };
};
