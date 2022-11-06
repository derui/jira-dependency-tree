import { jsx } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { ComponentSinks, ComponentSources } from "@/components/type";
import { selectAsMain } from "@/components/helper";
import { Reducer, StateSource } from "@cycle/state";
import xs, { Stream } from "xstream";

type SelectedSprint = { kind: "current" } | { kind: "suggested"; sprintName: string };

export interface ProjectToolbarState {
  selectedSprint: SelectedSprint;
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

  return { state$: sources.state.stream, layouterClicked$: selectorOpenerClicked };
};

const model = function model(actions: ReturnType<typeof intent>) {
  const currentSelectedSprint$ = xs.merge(actions.state$.map((v) => v.selectedSprint));
  const selectorOpened$ = xs.merge(actions.layouterClicked$.mapTo("layouter" as const)).fold((accum, v) => {
    switch (v) {
      case "layouter":
        return !accum;
    }
  }, false);

  return xs.combine(currentSelectedSprint$, selectorOpened$).map(([currentSelectedSprint, selectorOpened]) => {
    return { currentSelectedSprint, selectorOpened };
  });
};

const view = function view(state$: ReturnType<typeof model>) {
  return state$.map(({ currentSelectedSprint, selectorOpened }) => {
    let currentType = "Current Sprint";
    switch (currentSelectedSprint.kind) {
      case "current":
        currentType = "Current Sprint";
        break;
      case "suggested":
        currentType = currentSelectedSprint.sprintName;
        break;
    }

    return (
      <ul class={{ "project-toolbar": true }} dataset={{ testid: "main" }}>
        <li
          class={{ "project-toolbar__sprint-selector": true, "--opened": selectorOpened }}
          dataset={{ testid: "opener" }}
        >
          <span class={{ "sprint-selector__icon": true }}></span>
          <span class={{ "sprint-selector__current-type": true }}>{currentType}</span>

          <div
            class={{ "sprint-selector__main": true, "--opened": selectorOpened }}
            dataset={{ testid: "selector" }}
          ></div>
        </li>
      </ul>
    );
  });
};

export const ProjectToolbar = function ProjectToolbar(sources: ProjectToolbarSources): ProjectToolbarSinks {
  const actions = intent(sources);
  const state$ = model(actions);

  const initialReducer$ = xs.of<Reducer<ProjectToolbarState>>(() => {
    return {
      selectedSprint: { kind: "current" },
    };
  });

  return {
    DOM: view(state$),
    state: xs.merge(initialReducer$),
    value: xs.never(),
  };
};
