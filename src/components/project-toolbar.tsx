import { jsx } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { ComponentSinks, ComponentSources } from "@/components/type";
import { selectAsMain } from "@/components/helper";
import { Reducer, StateSource } from "@cycle/state";
import xs, { MemoryStream, Stream } from "xstream";
import produce from "immer";
import { SearchCondition } from "@/model/event";
import { Suggestor } from "./suggestor";
import { Suggestion } from "@/model/suggestion";

type ConditionType = "default" | "sprint" | "epic";

export interface ProjectToolbarState {
  conditionType: ConditionType;
  currentSearchCondition: SearchCondition;
}

type ProjectToolbarSources = ComponentSources<{
  props: MemoryStream<Suggestion>;
  state: StateSource<ProjectToolbarState>;
}>;

type ProjectToolbarSinks = ComponentSinks<{
  state: Stream<Reducer<ProjectToolbarState>>;
  value: Stream<SearchCondition>;
}>;

const intent = function intent(sources: ProjectToolbarSources) {
  const selectorOpenerClicked = selectAsMain(sources, ".project-toolbar__search-condition-editor").events("click");
  const cancelClicked$ = selectAsMain(sources, ".search-condition-editor__cancel").events("click");
  const typeChanged$ = selectAsMain(sources, "input[type=radio][name=type]")
    .events("change")
    .map((event) => {
      return (event.target as HTMLInputElement).value as ConditionType;
    });
  const epicChanged$ = selectAsMain(sources, "input[type=radio][name=epic]")
    .events("change")
    .map((event) => (event.target as HTMLInputElement).value);

  return {
    state$: sources.state.stream,
    openerClicked$: selectorOpenerClicked,
    typeChanged$,
    cancelClicked$,
    epicChanged$,
  };
};

const model = function model(actions: ReturnType<typeof intent>) {
  const currentConditionType$ = actions.state$.map((v) => v.conditionType);
  const selectorOpened$ = xs
    .merge(
      actions.openerClicked$.mapTo("search-condition-editor" as const),
      actions.cancelClicked$.mapTo("cancel" as const)
    )
    .fold((accum, v) => {
      switch (v) {
        case "search-condition-editor":
          return !accum;
        case "cancel":
          return false;
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
                attrs={{ type: "radio", name: "type", value: "default" }}
              ></input>
              Default <span class={{ "search-condition-editor__description": true }}>Current sprint</span>
            </label>
          </li>
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
            <span class={{ "search-condition-editor__input": true, "--selected": currentConditionType === "epic" }}>
              <span class={{ "search-condition-editor__epic-selector": true }}>
                <span class={{ "search-condition-epic-selector__icon": true }}></span>
                <input
                  class={{ "search-condition-epic-selector__input": true }}
                  attrs={{ type: "text", name: "epic" }}
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
    props: sources.props
      .map((v) => v.sprints.map((item) => ({ id: item.id, label: item.displayName, value: item.value as unknown })))
      .map((v) => ({ suggestions: v }))
      .remember(),
  });

  const initialReducer$ = xs.of<Reducer<ProjectToolbarState>>(() => {
    return {
      conditionType: "default",
      currentSearchCondition: {},
    };
  });

  const conditionForEpic$ = actions.epicChanged$.map<SearchCondition>((v) => {
    return { epic: v };
  });
  const conditionForSprint$ = suggestor.value.map<SearchCondition>((v) => {
    return { sprint: v.value as string };
  });

  const value$ = xs.merge(conditionForEpic$, conditionForSprint$);
  const changeReducer$ = actions.typeChanged$.map<Reducer<ProjectToolbarState>>((selectedSprint) => {
    return (prevState?: ProjectToolbarState) => {
      if (!prevState) return undefined;

      return produce(prevState, (draft) => {
        draft.conditionType = selectedSprint;
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

  return {
    DOM: view(state$, suggestor.DOM),
    state: xs.merge(initialReducer$, changeReducer$, valueChangeReducer$),
    value: value$,
  };
};
