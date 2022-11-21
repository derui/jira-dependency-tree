import { jsx } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { ComponentSinks, ComponentSources } from "@/components/type";
import { selectAsMain } from "@/components/helper";
import { Reducer, StateSource } from "@cycle/state";
import xs, { Stream } from "xstream";
import produce from "immer";
import { SearchCondition } from "@/model/event";
import { Suggestor } from "./suggestor";
import { source } from "@cycle/dom";

type ConditionType = "sprint" | "epic";

export interface ProjectToolbarState {
  conditionType: ConditionType;
  currentSearchCondition: SearchCondition;
}

type ProjectToolbarSources = ComponentSources<{
  state: StateSource<ProjectToolbarState>;
}>;

type ProjectToolbarSinks = ComponentSinks<{
  state: Stream<Reducer<ProjectToolbarState>>;
  value: Stream<SearchCondition>;
}>;

const intent = function intent(sources: ProjectToolbarSources) {
  const selectorOpenerClicked = selectAsMain(sources, ".project-toolbar__search-condition-editor").events("click");
  const changed = selectAsMain(sources, "input[type=radio]")
    .events("change")
    .map((event) => {
      return (event.target as HTMLInputElement).value as ConditionType;
    });

  return { state$: sources.state.stream, openerClicked$: selectorOpenerClicked, changed };
};

const model = function model(actions: ReturnType<typeof intent>) {
  const currentConditionType$ = actions.state$.map((v) => v.conditionType);
  const selectorOpened$ = xs
    .merge(actions.openerClicked$.mapTo("search-condition-editor" as const))
    .fold((accum, v) => {
      switch (v) {
        case "search-condition-editor":
          return !accum;
      }
    }, false);

  return xs.combine(currentConditionType$, selectorOpened$).map(([currentConditionType, selectorOpened]) => {
    return { currentConditionType, selectorOpened };
  });
};

const view = function view(state$: ReturnType<typeof model>, suggestor: any) {
  return xs.combine(state$, suggestor).map(([{ currentConditionType, selectorOpened }, suggestor]) => {
    return (
      <div class={{ "project-toolbar-wrapper": true }}>
        <ul class={{ "project-toolbar": true }} dataset={{ testid: "main" }}>
          <li
            class={{ "project-toolbar__search-condition-editor": true, "--opened": selectorOpened }}
            dataset={{ testid: "opener" }}
          ></li>
        </ul>
        <ul
          class={{ "search-condition-editor__main": true, "--opened": selectorOpened }}
          dataset={{ testid: "selector" }}
        >
          <li class={{ "search-condition-editor__cell": true }}>
            <label class={{ "search-condition-editor__label": true }}>
              <span
                class={{ "search-condition-editor__checkbox": true, "--checked": currentConditionType === "sprint" }}
              ></span>
              <input
                class={{ "search-condition-editor__radio": true }}
                attrs={{ type: "radio", name: "type", value: "sprint" }}
              ></input>
              Sprint
            </label>
            <span class={{ "search-condition-editor__input": true, "--selected": currentConditionType === "sprint" }}>
              {suggestor}
            </span>
          </li>
          <li class={{ "search-condition-editor__cell": true }}>
            <label class={{ "search-condition-editor__label": true }}>
              <span
                class={{ "search-condition-editor__checkbox": true, "--checked": currentConditionType === "epic" }}
              ></span>
              <input
                class={{ "search-condition-editor__radio": true }}
                attrs={{ type: "radio", name: "type", value: "epic" }}
              ></input>
              Epic
            </label>
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
    props: xs
      .of({
        suggestions: [
          {
            id: "id",
            label: "label",
            value: "value" as unknown,
          },
        ],
      })
      .remember(),
  });

  const initialReducer$ = xs.of<Reducer<ProjectToolbarState>>(() => {
    return {
      conditionType: "sprint",
      currentSearchCondition: {},
    };
  });

  const changeReducer$ = actions.changed.map<Reducer<ProjectToolbarState>>((selectedSprint) => {
    return (prevState?: ProjectToolbarState) => {
      if (!prevState) return undefined;

      return produce(prevState, (draft) => {
        draft.conditionType = selectedSprint;
      });
    };
  });

  return {
    DOM: view(state$, suggestor.DOM),
    state: xs.merge(initialReducer$, changeReducer$),
    value: xs.never(),
  };
};
