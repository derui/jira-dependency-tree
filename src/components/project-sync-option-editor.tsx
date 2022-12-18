import { jsx } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { ComponentSinkBase, ComponentSourceBase } from "./type";
import { AsNodeStream, classes, generateTestId, mergeNodes, selectAsMain, TestIdGenerator } from "./helper";
import { Reducer, StateSource } from "@cycle/state";
import xs, { MemoryStream, Stream } from "xstream";
import produce from "immer";
import { SearchCondition } from "@/model/event";
import { Suggestor, SuggestorProps } from "./suggestor";
import { SuggestedItem, Suggestion } from "@/model/suggestion";
import { Icon, IconProps } from "./atoms/icon";
import { Input, InputProps } from "./atoms/input";
import isolate from "@cycle/isolate";

const ConditionType = {
  Default: "default",
  Sprint: "sprint",
  Epic: "epic",
} as const;

type ConditionType = typeof ConditionType[keyof typeof ConditionType];

export interface ProjectSyncOptionEditorState {
  conditionType: ConditionType;
  currentSearchCondition: SearchCondition | undefined;
  lastTerm: string | undefined;
}

interface ProjectSyncOptionEditorSources extends ComponentSourceBase {
  props: MemoryStream<Suggestion>;
  state: StateSource<ProjectSyncOptionEditorState>;
}

interface ProjectSyncOptionEditorSinks extends ComponentSinkBase {
  state: Stream<Reducer<ProjectSyncOptionEditorState>>;
}

const intent = function intent(
  sources: ProjectSyncOptionEditorSources,
  suggestorSink: ReturnType<typeof Suggestor<SuggestedItem>>,
  epicInputSink: ReturnType<typeof Input>
) {
  const selectorOpenerClicked = selectAsMain(sources, "[data-id=opener]").events("click");
  const typeChanged$ = selectAsMain(sources, "select")
    .events("change")
    .map((event) => {
      return (event.target as HTMLSelectElement).value as ConditionType;
    });
  const cancel$ = selectAsMain(sources, "[data-id=cancel]").events("click").mapTo(false);
  const submit$ = selectAsMain(sources, "[data-id=submit]").events("click").mapTo(false);

  return {
    props$: sources.props,
    state$: sources.state.stream,
    openerClicked$: selectorOpenerClicked,
    typeChanged$,
    epicChanged$: epicInputSink.input,
    cancel$,
    submit$,
    suggestedValue$: suggestorSink.value,
  };
};

const model = function model(actions: ReturnType<typeof intent>) {
  return actions.props$
    .map(() => {
      const currentConditionType$ = actions.state$.map((v) => v.conditionType);
      const currentCondition$ = actions.state$.map((v) => v.currentSearchCondition);

      const selectorOpened$ = xs
        .merge(actions.openerClicked$.mapTo(true), actions.cancel$, actions.submit$)
        .fold((_, v) => v, false);

      const conditionForEpic$ = actions.epicChanged$.map<SearchCondition>((v) => {
        return { epic: v };
      });
      const conditionForSprint$ = actions.suggestedValue$.map<SearchCondition>((v) => {
        return { sprint: v };
      });
      const conditionForDefault$ = actions.typeChanged$.filter((v) => v === "default").mapTo<SearchCondition>({});
      const nextCondition$ = xs.merge(conditionForEpic$, conditionForDefault$, conditionForSprint$).startWith({});

      return xs
        .combine(currentConditionType$, selectorOpened$, currentCondition$, nextCondition$)
        .map(([currentConditionType, selectorOpened, currentCondition, nextCondition]) => {
          return { currentConditionType, selectorOpened, currentCondition, nextCondition };
        });
    })
    .flatten();
};

const currentConditionName = (condition: SearchCondition | undefined) => {
  if (condition?.epic) {
    return condition.epic;
  } else if (condition?.sprint) {
    return condition.sprint.displayName;
  }

  return "Current Sprint";
};

const Styles = {
  root: classes("relative", "w-full", "flex", "items-center", "justify-center"),
  opener: (opened: boolean) => {
    return {
      ...classes(
        "inline-flex",
        "px-3",
        "py-2",
        "border",
        "border-gray",
        "bg-white",
        "rounded",
        "transition-colors",
        "hover:text-white",
        "hover:bg-secondary1-200",
        "hover:border-secondary1-500",
        "cursor-pointer",
        "items-center",
        "whitespace-nowrap"
      ),

      ...(!opened ? classes("border-gray", "bg-white") : {}),
      ...(opened ? classes("text-white", "bg-secondary1-200", "border-secondary1-500") : {}),
    };
  },
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
        "transition-width"
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
    "whitespace-nowrap"
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

const view = function view(
  state$: ReturnType<typeof model>,
  nodes$: AsNodeStream<["suggestor", "cancel", "submit", "epicInput"]>,
  gen: TestIdGenerator
) {
  return xs
    .combine(state$, nodes$)
    .map(([{ currentConditionType, selectorOpened: editorOpened, currentCondition }, nodes]) => {
      return (
        <div class={Styles.root}>
          <button class={Styles.opener(editorOpened)} dataset={{ testid: gen("opener"), id: "opener" }}>
            {currentConditionName(currentCondition)}
          </button>
          <div class={Styles.searchConditionEditorContainer(editorOpened)} dataset={{ testid: gen("selector") }}>
            <h2 class={Styles.header}>Select method to synchronize issues</h2>
            <div class={Styles.baseForm}>
              <select class={Styles.selection}>
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
            <div class={Styles.sprintSuggestor(currentConditionType === ConditionType.Sprint)}>{nodes.suggestor}</div>
            <div class={Styles.epicInput(currentConditionType === ConditionType.Epic)}>{nodes.epicInput}</div>
          </div>
        </div>
      );
    });
};

export const ProjectSyncOptionEditor = (sources: ProjectSyncOptionEditorSources): ProjectSyncOptionEditorSinks => {
  const suggestor = Suggestor({
    ...sources,
    props: sources.props
      .map<SuggestorProps<SuggestedItem>>((v) => {
        const suggestions = v.sprints.map((item) => ({ id: item.id, label: item.displayName, value: item }));

        return {
          loading: false,
          suggestions,
        };
      })
      .remember(),
    testid: "sprint-suggestor",
  });

  const cancelIcon = Icon({
    ...sources,
    props: xs.of<IconProps>({
      type: "circle-x",
      color: "gray",
      size: "m",
    }),
  });

  const submitIcon = Icon({
    ...sources,
    props: xs.of<IconProps>({
      type: "circle-check",
      color: "complement",
      size: "m",
    }),
  });

  const epicInput = isolate(
    Input,
    "nameInput"
  )({
    ...sources,
    props: sources.state
      .select<ProjectSyncOptionEditorState["currentSearchCondition"]>("currentSearchCondition")
      .stream.map<InputProps>((condition) => {
        return {
          value: condition?.epic ?? "",
          placeholder: "e.g. TES-105",
        };
      }),
  });

  const actions = intent(sources, suggestor, epicInput);
  const state$ = model(actions);

  const initialReducer$ = xs.of<Reducer<ProjectSyncOptionEditorState>>(() => {
    return {
      conditionType: "default",
      currentSearchCondition: {},
      lastTerm: undefined,
    };
  });

  const changeReducer$ = actions.typeChanged$.map<Reducer<ProjectSyncOptionEditorState>>((conditionType) => {
    return (prevState?: ProjectSyncOptionEditorState) => {
      if (!prevState) return undefined;

      return produce(prevState, (draft) => {
        draft.conditionType = conditionType;
      });
    };
  });

  const valueChangeReducer$ = actions.submit$
    .map(() => {
      return state$.map((v) => v.nextCondition).take(1);
    })
    .flatten()
    .map<Reducer<ProjectSyncOptionEditorState>>((condition) => {
      return (prevState?: ProjectSyncOptionEditorState) => {
        if (!prevState) return undefined;

        return produce(prevState, (draft) => {
          draft.currentSearchCondition = condition;
        });
      };
    });

  const termReducer$ = suggestor.term.map<Reducer<ProjectSyncOptionEditorState>>((lastTerm) => {
    return (prevState?: ProjectSyncOptionEditorState) => {
      if (!prevState) return undefined;

      return produce(prevState, (draft) => {
        draft.lastTerm = lastTerm;
      });
    };
  });

  const termResetReducer$ = suggestor.value.map<Reducer<ProjectSyncOptionEditorState>>(() => {
    return (prevState?: ProjectSyncOptionEditorState) => {
      if (!prevState) return undefined;

      return produce(prevState, (draft) => {
        draft.lastTerm = undefined;
      });
    };
  });

  return {
    DOM: view(
      state$,
      mergeNodes({
        suggestor: suggestor.DOM,
        cancel: cancelIcon.DOM,
        submit: submitIcon.DOM,
        epicInput: epicInput.DOM,
      }),
      generateTestId(sources.testid)
    ),
    state: xs.merge(initialReducer$, changeReducer$, termReducer$, termResetReducer$, valueChangeReducer$),
  };
};
