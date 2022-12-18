import { jsx, VNode } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { ComponentSinkBase, ComponentSourceBase } from "./type";
import { classes, generateTestId, selectAsMain, TestIdGenerator } from "./helper";
import { Reducer, StateSource } from "@cycle/state";
import xs, { MemoryStream, Stream } from "xstream";
import produce from "immer";
import { SearchCondition } from "@/model/event";
import { Suggestor, SuggestorProps } from "./suggestor";
import { SuggestedItem, Suggestion } from "@/model/suggestion";

type ConditionType = "default" | "sprint" | "epic";

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
  suggestorSink: ReturnType<typeof Suggestor<SuggestedItem>>
) {
  const selectorOpenerClicked = selectAsMain(sources, "[data-id=opener]").events("click");
  const typeChanged$ = selectAsMain(sources, ".search-condition-editor__radio")
    .events("change")
    .map((event) => {
      return (event.target as HTMLInputElement).value as ConditionType;
    });
  const epicChanged$ = selectAsMain(sources, ".search-condition-epic-selector__input")
    .events("change")
    .map((event) => (event.target as HTMLInputElement).value);

  return {
    props$: sources.props,
    state$: sources.state.stream,
    openerClicked$: selectorOpenerClicked,
    typeChanged$,
    epicChanged$,
    suggestedValue$: suggestorSink.value,
  };
};

const model = function model(actions: ReturnType<typeof intent>) {
  return actions.props$
    .map(() => {
      const currentConditionType$ = actions.state$.map((v) => v.conditionType);
      const selectorOpened$ = xs
        .merge(actions.openerClicked$.mapTo("search-condition-editor" as const))
        .fold((accum, v) => {
          switch (v) {
            case "search-condition-editor":
              return !accum;
          }
        }, false);

      const conditionForEpic$ = actions.epicChanged$.map<SearchCondition>((v) => {
        return { epic: v };
      });
      const conditionForSprint$ = actions.suggestedValue$.map<SearchCondition>((v) => {
        return { sprint: v };
      });
      const conditionForDefault$ = actions.typeChanged$.filter((v) => v === "default").mapTo<SearchCondition>({});

      const currentCondition$ = xs.merge(conditionForEpic$, conditionForSprint$, conditionForDefault$).startWith({});

      return xs
        .combine(currentConditionType$, selectorOpened$, currentCondition$)
        .map(([currentConditionType, selectorOpened, currentCondition]) => {
          return { currentConditionType, selectorOpened, currentCondition };
        });
    })
    .flatten();
};

const currentConditionName = (condition: SearchCondition) => {
  if (condition.epic) {
    return condition.epic;
  } else if (condition.sprint) {
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
      ...(!opened ? classes("w-0", "invisible") : {}),
    };
  },
};

const view = function view(state$: ReturnType<typeof model>, suggestor: Stream<VNode>, gen: TestIdGenerator) {
  return xs
    .combine(state$, suggestor)
    .map(([{ currentConditionType, selectorOpened: editorOpened, currentCondition }, suggestor]) => {
      return (
        <div class={Styles.root}>
          <button class={Styles.opener(editorOpened)} dataset={{ testid: gen("opener"), id: "opener" }}>
            {currentConditionName(currentCondition)}
          </button>
          <ul class={Styles.searchConditionEditorContainer(editorOpened)} dataset={{ testid: gen("selector") }}>
            <li class={{ "search-condition-editor__cell": true }}>
              <label
                class={{ "search-condition-editor__label": true }}
                dataset={{ testid: gen("search-condition-default") }}
              >
                <span
                  class={{ "search-condition-editor__checkbox": true, "--checked": currentConditionType === "default" }}
                ></span>
                <input
                  class={{ "search-condition-editor__radio": true }}
                  attrs={{ type: "radio", name: "type", value: "default", checked: currentConditionType === "default" }}
                ></input>
                Default <span class={{ "search-condition-editor__description": true }}>Current sprint</span>
              </label>
            </li>
            <li class={{ "search-condition-editor__cell": true }}>
              <label
                class={{ "search-condition-editor__label": true }}
                dataset={{ testid: gen("search-condition-sprint") }}
              >
                <span
                  class={{ "search-condition-editor__checkbox": true, "--checked": currentConditionType === "sprint" }}
                ></span>
                <input
                  class={{ "search-condition-editor__radio": true }}
                  attrs={{ type: "radio", name: "type", value: "sprint", checked: currentConditionType === "sprint" }}
                ></input>
                Sprint
              </label>
              <span class={{ "search-condition-editor__input": true, "--selected": currentConditionType === "sprint" }}>
                {suggestor}
              </span>
            </li>
            <li class={{ "search-condition-editor__cell": true }}>
              <label
                class={{ "search-condition-editor__label": true }}
                dataset={{ testid: gen("search-condition-epic") }}
              >
                <span
                  class={{ "search-condition-editor__checkbox": true, "--checked": currentConditionType === "epic" }}
                ></span>
                <input
                  class={{ "search-condition-editor__radio": true }}
                  attrs={{ type: "radio", name: "type", value: "epic", checked: currentConditionType === "epic" }}
                ></input>
                Epic
              </label>
              <span class={{ "search-condition-editor__input": true, "--selected": currentConditionType === "epic" }}>
                <span class={{ "search-condition-editor__epic-selector": true }}>
                  <span class={{ "search-condition-epic-selector__icon": true }}></span>
                  <input
                    class={{ "search-condition-epic-selector__input": true }}
                    attrs={{ type: "text", name: "epic", placeholder: "Epic" }}
                    dataset={{ testid: gen("epic-input") }}
                  ></input>
                </span>
              </span>
            </li>
            <li class={{ "search-condition-editor__footer": true }}>
              <button class={{ "search-condition-editor__cancel": true }}>Cancel</button>
              <button
                class={{ "search-condition-editor__submit": true }}
                dataset={{ testid: gen("submit") }}
                attrs={{ type: "submit" }}
              >
                Apply
              </button>
            </li>
          </ul>
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

  const actions = intent(sources, suggestor);
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

  // const valueChangeReducer$ = state$
  //   .map((v) => v.currentCondition)
  //   .filter(filterUndefined)
  //   .map((v) => {
  //     return actions.submitClicked$.mapTo(v);
  //   })
  //   .flatten()
  //   .map<Reducer<ProjectSyncOptionEditorState>>((condition) => {
  //     return (prevState?: ProjectSyncOptionEditorState) => {
  //       if (!prevState) return undefined;

  //       return produce(prevState, (draft) => {
  //         draft.currentSearchCondition = condition;
  //       });
  //     };
  //   });

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
    DOM: view(state$, suggestor.DOM, generateTestId(sources.testid)),
    state: xs.merge(initialReducer$, changeReducer$, termReducer$, termResetReducer$),
  };
};
