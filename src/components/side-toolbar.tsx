import { jsx } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { ComponentSinks, ComponentSources } from "@/components/type";
import { selectAsMain } from "@/components/helper";
import { GraphLayout } from "@/issue-graph/type";
import { Reducer, StateSource } from "@cycle/state";
import xs, { MemoryStream, Stream } from "xstream";

export interface SideToolbarState {
  graphLayout: GraphLayout;
}

type SideToolbarSources = ComponentSources<{
  props: MemoryStream<GraphLayout>;
  state: StateSource<SideToolbarState>;
}>;

type SideToolbarSinks = ComponentSinks<{
  state: Stream<Reducer<SideToolbarState>>;
}>;

const intent = function intent(sources: SideToolbarSources) {
  const layouterClicked$ = selectAsMain(sources, ".side-toolbar__graph-layout").events("click");
  const verticalClicked$ = selectAsMain(sources, ".graph-layouter__vertical")
    .events("click", undefined, false)
    .mapTo(GraphLayout.Vertical);
  const horizontalClicked$ = selectAsMain(sources, ".graph-layouter__horizontal")
    .events("click", undefined, false)
    .mapTo(GraphLayout.Horizontal);

  return { state$: sources.state.stream, layouterClicked$, verticalClicked$, horizontalClicked$ };
};

const model = function model(actions: ReturnType<typeof intent>) {
  const layout$ = xs.merge(
    actions.state$.map((v) => v.graphLayout),
    actions.verticalClicked$,
    actions.horizontalClicked$
  );
  const layouterOpened$ = xs
    .merge(
      actions.layouterClicked$.mapTo("layouter" as const),
      actions.verticalClicked$.mapTo("layout" as const),
      actions.horizontalClicked$.mapTo("layout" as const)
    )
    .fold((accum, v) => {
      switch (v) {
        case "layouter":
          return !accum;
        case "layout":
          return false;
      }
    }, false);

  return xs.combine(layout$, layouterOpened$).map(([layout, layouterOpened]) => {
    return { layout, layouterOpened };
  });
};

const view = function view(state$: ReturnType<typeof model>) {
  return state$.map(({ layout, layouterOpened }) => {
    return (
      <ul class={{ "side-toolbar": true }} dataset={{ testid: "main" }}>
        <li
          class={{ "side-toolbar__graph-layout": true, "--opened": layouterOpened }}
          dataset={{ testid: "graph-layout" }}
        >
          <div
            class={{ "graph-layout__graph-layouter": true, "--opened": layouterOpened }}
            dataset={{ testid: "layouter" }}
          >
            <span
              class={{ "graph-layouter__horizontal": true, "--selected": layout === GraphLayout.Horizontal }}
              dataset={{ testid: "horizontal" }}
            ></span>
            <span
              class={{ "graph-layouter__vertical": true, "--selected": layout === GraphLayout.Vertical }}
              dataset={{ testid: "vertical" }}
            ></span>
          </div>
        </li>
      </ul>
    );
  });
};

export const SideToolbar = function SideToolbar(sources: SideToolbarSources): SideToolbarSinks {
  const actions = intent(sources);
  const state$ = model(actions);

  const initialReducer$ = sources.props.map<Reducer<SideToolbarState>>((graphLayout) => {
    return () => {
      return {
        graphLayout,
      };
    };
  });

  return {
    DOM: view(state$),
    state: xs.merge(initialReducer$),
  };
};
