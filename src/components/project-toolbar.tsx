import { jsx } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { ComponentSinkBase, ComponentSourceBase } from "./type";
import { generateTestId, selectAsMain, TestIdGenerator } from "./helper";
import { Reducer, StateSource } from "@cycle/state";
import xs, { MemoryStream, Stream } from "xstream";
import produce from "immer";
import { SearchCondition } from "@/model/event";
import { Suggestor, SuggestorProps } from "./suggestor";
import { Suggestion } from "@/model/suggestion";

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

const intent = function intent(sources: ProjectToolbarSources) {
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

  const suggestions$ = actions.props$.map((v) =>
    v.sprints.map((item) => ({ id: item.id, label: item.displayName, value: item.value as unknown }))
  );

  return xs
    .combine(currentConditionType$, selectorOpened$, suggestions$)
    .map(([currentConditionType, selectorOpened, suggestions]) => {
      return { currentConditionType, selectorOpened, suggestions };
    });
};

const view = function view(state$: ReturnType<typeof model>, suggestor: any, gen: TestIdGenerator) {
  return xs.combine(state$, suggestor).map(([{ currentConditionType, selectorOpened }, suggestor]) => {
    return (
      <div class={{ "project-toolbar-wrapper": true }}>
        <ul class={{ "project-toolbar": true }} dataset={{ testid: gen("root") }}>
          <li
            class={{ "project-toolbar__search-condition-editor": true, "--opened": selectorOpened }}
            dataset={{ testid: gen("condition-editor") }}
          ></li>
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
            <button class={{ "search-condition-editor__submit": true }} attrs={{ type: "submit" }}>
              Apply
            </button>
          </li>
        </ul>
      </div>
    );
  });
};

export const ProjectToolbar = function ProjectToolbar(sources: ProjectToolbarSources): ProjectToolbarSinks {
  const actions = intent(sources);
  const state$ = model(actions);

  const suggestor = Suggestor({
    ...sources,
    props: state$
      .map<SuggestorProps>((v) => {
        return {
          loading: false,
          suggestions: v.suggestions,
        };
      })
      .remember(),
    testid: "sprint-suggestor",
  });

  const initialReducer$ = xs.of<Reducer<ProjectToolbarState>>(() => {
    return {
      conditionType: "default",
      currentSearchCondition: {},
      lastTerm: undefined,
    };
  });

  const conditionForEpic$ = actions.epicChanged$.map<SearchCondition>((v) => {
    return { epic: v };
  });
  const conditionForSprint$ = suggestor.value.map<SearchCondition>((v) => {
    return { sprint: v.value as string };
  });
  const conditionForDefault$ = actions.typeChanged$.filter((v) => v === "default").mapTo(undefined);

  const value$ = xs
    .merge(conditionForEpic$, conditionForSprint$, conditionForDefault$)
    .map((v) => {
      return actions.submitClicked$.mapTo(v);
    })
    .flatten();

  const changeReducer$ = actions.typeChanged$.map<Reducer<ProjectToolbarState>>((conditionType) => {
    return (prevState?: ProjectToolbarState) => {
      if (!prevState) return undefined;

      return produce(prevState, (draft) => {
        draft.conditionType = conditionType;
      });
    };
  });

  const valueChangeReducer$ = value$.map<Reducer<ProjectToolbarState>>((condition) => {
    return (prevState?: ProjectToolbarState) => {
      if (!prevState) return undefined;

      return produce(prevState, (draft) => {
        draft.currentSearchCondition = condition;
      });
    };
  });

  const termReducer$ = suggestor.value
    .filter((v) => v.kind === "term")
    .map<Reducer<ProjectToolbarState>>((lastTerm) => {
      return (prevState?: ProjectToolbarState) => {
        if (!prevState) return undefined;

        return produce(prevState, (draft) => {
          if (lastTerm.kind === "term" && lastTerm.value.length > 0) {
            draft.lastTerm = lastTerm.value;
          }
        });
      };
    });

  const termResetReducer$ = suggestor.value
    .filter((v) => v.kind === "submit")
    .map<Reducer<ProjectToolbarState>>(() => {
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
