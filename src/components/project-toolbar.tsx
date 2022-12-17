import { jsx, VNode } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { ComponentSinkBase, ComponentSourceBase } from "./type";
import { generateTestId, selectAsMain, TestIdGenerator } from "./helper";
import { Reducer, StateSource } from "@cycle/state";
import xs, { MemoryStream, Stream } from "xstream";
import produce from "immer";
import { SearchCondition } from "@/model/event";
import { Suggestor, SuggestorProps } from "./suggestor";
import { SuggestedItem, Suggestion } from "@/model/suggestion";
import { filterUndefined } from "@/util/basic";

type ConditionType = "default" | "sprint" | "epic";

export interface ProjectToolbarState {
  conditionType: ConditionType;
  currentSearchCondition: SearchCondition | undefined;
  lastTerm: string | undefined;
}

interface ProjectToolbarSources extends ComponentSourceBase {
  props: MemoryStream<Suggestion>;
  state: StateSource<ProjectToolbarState>;
}

interface ProjectToolbarSinks extends ComponentSinkBase {
  state: Stream<Reducer<ProjectToolbarState>>;
}

const intent = function intent(
  sources: ProjectToolbarSources,
  suggestorSink: ReturnType<typeof Suggestor<SuggestedItem>>
) {
  const selectorOpenerClicked = selectAsMain(sources, ".project-toolbar__search-condition-editor").events("click");
  const cancelClicked$ = selectAsMain(sources, ".search-condition-editor__cancel").events("click");
  const submitClicked$ = selectAsMain(sources, ".search-condition-editor__submit").events("click");
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
    cancelClicked$,
    epicChanged$,
    submitClicked$,
    suggestedValue$: suggestorSink.value,
  };
};

const model = function model(actions: ReturnType<typeof intent>) {
  const currentConditionType$ = actions.state$.map((v) => v.conditionType);
  const selectorOpened$ = xs
    .merge(
      actions.openerClicked$.mapTo("search-condition-editor" as const),
      actions.cancelClicked$.mapTo("cancel" as const),
      actions.submitClicked$.mapTo("submit" as const)
    )
    .fold((accum, v) => {
      switch (v) {
        case "search-condition-editor":
          return !accum;
        case "cancel":
        case "submit":
          return false;
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
};

const currentConditionName = (condition: SearchCondition) => {
  if (condition.epic) {
    return condition.epic;
  } else if (condition.sprint) {
    return condition.sprint.displayName;
  }

  return "Current Sprint";
};

const view = function view(state$: ReturnType<typeof model>, suggestor: Stream<VNode>, gen: TestIdGenerator) {
  return xs
    .combine(state$, suggestor)
    .map(([{ currentConditionType, selectorOpened, currentCondition }, suggestor]) => {
      return (
        <div class={{ "project-toolbar-wrapper": true }}>
          <ul class={{ "project-toolbar": true }} dataset={{ testid: gen("root") }}>
            <li
              class={{ "project-toolbar__search-condition-editor": true, "--opened": selectorOpened }}
              dataset={{ testid: gen("condition-editor") }}
            >
              {currentConditionName(currentCondition)}
            </li>
          </ul>
          <ul
            class={{ "search-condition-editor__main": true, "--opened": selectorOpened }}
            dataset={{ testid: gen("selector") }}
          >
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

export const ProjectToolbar = function ProjectToolbar(sources: ProjectToolbarSources): ProjectToolbarSinks {
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

  const initialReducer$ = xs.of<Reducer<ProjectToolbarState>>(() => {
    return {
      conditionType: "default",
      currentSearchCondition: {},
      lastTerm: undefined,
    };
  });

  const changeReducer$ = actions.typeChanged$.map<Reducer<ProjectToolbarState>>((conditionType) => {
    return (prevState?: ProjectToolbarState) => {
      if (!prevState) return undefined;

      return produce(prevState, (draft) => {
        draft.conditionType = conditionType;
      });
    };
  });

  const valueChangeReducer$ = state$
    .map((v) => v.currentCondition)
    .filter(filterUndefined)
    .map((v) => {
      return actions.submitClicked$.mapTo(v);
    })
    .flatten()
    .map<Reducer<ProjectToolbarState>>((condition) => {
      return (prevState?: ProjectToolbarState) => {
        if (!prevState) return undefined;

        return produce(prevState, (draft) => {
          draft.currentSearchCondition = condition;
        });
      };
    });

  const termReducer$ = suggestor.term.map<Reducer<ProjectToolbarState>>((lastTerm) => {
    return (prevState?: ProjectToolbarState) => {
      if (!prevState) return undefined;

      return produce(prevState, (draft) => {
        draft.lastTerm = lastTerm;
      });
    };
  });

  const termResetReducer$ = suggestor.value.map<Reducer<ProjectToolbarState>>(() => {
    return (prevState?: ProjectToolbarState) => {
      if (!prevState) return undefined;

      return produce(prevState, (draft) => {
        draft.lastTerm = undefined;
      });
    };
  });

  return {
    DOM: view(state$, suggestor.DOM, generateTestId(sources.testid)),
    state: xs.merge(initialReducer$, changeReducer$, valueChangeReducer$, termReducer$, termResetReducer$),
  };
};
