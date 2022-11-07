import { jsx } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { ComponentSinks, ComponentSources } from "@/components/type";
import { selectAsMain } from "@/components/helper";
import { Reducer, StateSource } from "@cycle/state";
import xs, { Stream } from "xstream";
import produce from "immer";

type SelectedSprint = { kind: "current" } | { kind: "suggestion"; sprintName: string };
type SelectedSprintKind = "current" | "suggestion";

export interface ProjectToolbarState {
  selectedSprintKind: SelectedSprintKind;
  suggestedSprint?: string;
}

type ProjectToolbarSources = ComponentSources<{
  state: StateSource<ProjectToolbarState>;
}>;

type ProjectToolbarSinks = ComponentSinks<{
  state: Stream<Reducer<ProjectToolbarState>>;
  value: Stream<SelectedSprint>;
}>;

const intent = function intent(sources: ProjectToolbarSources) {
  const selectorOpenerClicked = selectAsMain(sources, ".project-toolbar__sprint-selector").events("click");
  const changed = selectAsMain(sources, "input[type=radio]")
    .events("change")
    .map((event) => {
      return (event.target as HTMLInputElement).value as SelectedSprintKind;
    });

  return { state$: sources.state.stream, layouterClicked$: selectorOpenerClicked, changed };
};

const model = function model(actions: ReturnType<typeof intent>) {
  const currentSelectedSprint$ = actions.state$.map((v) => v.selectedSprintKind);
  const suggestionSprint$ = actions.state$.map((v) => v.suggestedSprint);
  const selectorOpened$ = xs.merge(actions.layouterClicked$.mapTo("layouter" as const)).fold((accum, v) => {
    switch (v) {
      case "layouter":
        return !accum;
    }
  }, false);

  return xs
    .combine(currentSelectedSprint$, selectorOpened$, suggestionSprint$)
    .map(([currentSelectedSprint, selectorOpened, suggestedSprint]) => {
      return { currentSelectedSprint, selectorOpened, suggestedSprint };
    });
};

const view = function view(state$: ReturnType<typeof model>) {
  return state$.map(({ currentSelectedSprint, selectorOpened, suggestedSprint }) => {
    let currentType = "Editing...";
    if (!selectorOpened) {
      switch (currentSelectedSprint) {
        case "current":
          currentType = "Current Sprint";
          break;
        case "suggestion":
          currentType = suggestedSprint ?? "Select Sprint";
          break;
      }
    }

    return (
      <div class={{ "project-toolbar-wrapper": true }}>
        <ul class={{ "project-toolbar": true }} dataset={{ testid: "main" }}>
          <li
            class={{ "project-toolbar__sprint-selector": true, "--opened": selectorOpened }}
            dataset={{ testid: "opener" }}
          >
            <span class={{ "sprint-selector__current-type": true }}>{currentType}</span>
          </li>
        </ul>
        <ul class={{ "sprint-selector__main": true, "--opened": selectorOpened }} dataset={{ testid: "selector" }}>
          <li>
            <label class={{ "sprint-selector__label": true }}>
              <span
                class={{ "sprint-selector__checkbox": true, "--checked": currentSelectedSprint === "current" }}
              ></span>
              <input
                class={{ "sprint-selector__radio": true }}
                attrs={{ type: "radio", name: "sprint", value: "current" }}
              ></input>
              Current Sprint
            </label>
          </li>
          <li>
            <label class={{ "sprint-selector__label": true }}>
              <span
                class={{ "sprint-selector__checkbox": true, "--checked": currentSelectedSprint === "suggestion" }}
              ></span>
              <input
                class={{ "sprint-selector__radio": true }}
                attrs={{ type: "radio", name: "sprint", value: "suggestion" }}
              ></input>
              Other Sprint
            </label>
          </li>
          <li class={{ "sprint-selector__footer": true }}>
            <button class={{ "sprint-selector__cancel": true }}>Cancel</button>
            <button class={{ "sprint-selector__submit": true }} attrs={{ type: "submit" }}>
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

  const initialReducer$ = xs.of<Reducer<ProjectToolbarState>>(() => {
    return {
      selectedSprintKind: "current",
    };
  });

  const changeReducer$ = actions.changed.map<Reducer<ProjectToolbarState>>((selectedSprint) => {
    return (prevState?: ProjectToolbarState) => {
      if (!prevState) return undefined;

      return produce(prevState, (draft) => {
        draft.selectedSprintKind = selectedSprint;
      });
    };
  });

  return {
    DOM: view(state$),
    state: xs.merge(initialReducer$, changeReducer$),
    value: xs.never(),
  };
};
