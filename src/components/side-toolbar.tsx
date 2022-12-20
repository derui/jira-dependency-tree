import { jsx } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { Reducer, StateSource } from "@cycle/state";
import xs, { MemoryStream, Stream } from "xstream";
import { Icon, IconProps } from "./atoms/icon";
import { AsNodeStream, ComponentSource, domSourceOf, mergeNodes } from "./helper";
import { GraphLayout } from "@/issue-graph/type";
import { classes, generateTestId, ComponentSink } from "@/components/helper";

export interface SideToolbarState {
  graphLayout: GraphLayout;
}

interface SideToolbarSources extends ComponentSource {
  props: MemoryStream<GraphLayout>;
  state: StateSource<SideToolbarState>;
}

interface SideToolbarSinks extends ComponentSink<"DOM"> {
  state: Stream<Reducer<SideToolbarState>>;
}

const intent = (sources: SideToolbarSources) => {
  const layouterClicked$ = domSourceOf(sources).select('[data-id="opener"]').events("click");
  const verticalClicked$ = domSourceOf(sources)
    .select('[data-id="vertical"]')
    .events("click", undefined, false)
    .mapTo(GraphLayout.Vertical);
  const horizontalClicked$ = domSourceOf(sources)
    .select('[data-id="horizontal"]')
    .events("click", undefined, false)
    .mapTo(GraphLayout.Horizontal);

  return { state$: sources.state.stream, layouterClicked$, verticalClicked$, horizontalClicked$ };
};

const model = (actions: ReturnType<typeof intent>) => {
  const layout$ = xs.merge(actions.state$.map((v) => v.graphLayout));
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

const Styles = {
  root: classes("absolute", "flex", "left-4", "top-half", "bg-white", "rounded", "list-none", "top-1/2", "shadow-md"),
  graphLayout: classes("relative", "flex-none", "bg-white", "transition-colors", "cursor-pointer", "p-3", "rounded"),
  graphLayouter: (opened: boolean) => {
    return {
      ...classes(
        "absolute",
        "flex",
        "flex-row",
        "left-16",
        "top-0",
        "bg-white",
        "rounded",
        "transition-left",
        "shadow-lg",
        "transition-opacity",
        "opacity-0"
      ),
      ...(opened ? classes("opacity-100", "visible") : {}),
      ...(!opened ? classes("invisible") : {}),
    };
  },
  iconButton: classes("flex-none", "bg-white", "p-3", "cursor-pointer", "rounded"),
};

const view = (
  state$: ReturnType<typeof model>,
  nodes$: AsNodeStream<["graphLayoutIcon", "verticalIcon", "horizontalIcon"]>,
  gen: ReturnType<typeof generateTestId>
) => {
  return xs.combine(state$, nodes$).map(([{ layout, layouterOpened }, nodes]) => {
    return (
      <ul class={Styles.root}>
        <li class={Styles.graphLayout} dataset={{ testid: gen("graph-layout"), id: "opener" }}>
          {nodes.graphLayoutIcon}
          <div
            class={Styles.graphLayouter(layouterOpened)}
            dataset={{ testid: gen("layouter"), opened: `${layouterOpened}` }}
          >
            <span
              class={{ ...Styles.iconButton }}
              dataset={{
                testid: gen("horizontal"),
                id: "horizontal",
                selected: `${layout === GraphLayout.Horizontal}`,
              }}
            >
              {nodes.horizontalIcon}
            </span>
            <span
              class={{ ...Styles.iconButton }}
              dataset={{ testid: gen("vertical"), id: "vertical", selected: `${layout === GraphLayout.Vertical}` }}
            >
              {nodes.verticalIcon}
            </span>
          </div>
        </li>
      </ul>
    );
  });
};

export const SideToolbar = function SideToolbar(sources: SideToolbarSources): SideToolbarSinks {
  const graphLayoutIcon = Icon({
    ...sources,
    props: xs.of<IconProps>({
      type: "layout-2",
      size: "m",
      color: "secondary1",
    }),
  });

  const verticalIcon = Icon({
    ...sources,
    props: xs.of<IconProps>({
      type: "layout-distribute-vertical",
      size: "m",
      color: "secondary1",
    }),
  });

  const horizontalIcon = Icon({
    ...sources,
    props: xs.of<IconProps>({
      type: "layout-distribute-horizontal",
      size: "m",
      color: "secondary1",
    }),
  });

  const actions = intent(sources);
  const state$ = model(actions);

  const initialReducer$ = sources.props.map<Reducer<SideToolbarState>>((graphLayout) => {
    return () => {
      return {
        graphLayout,
      };
    };
  });
  const changedLayout$ = xs.merge(actions.verticalClicked$, actions.horizontalClicked$);
  const reducer$ = changedLayout$.map<Reducer<SideToolbarState>>((v) => () => {
    return { graphLayout: v };
  });

  return {
    DOM: view(
      state$,
      mergeNodes({
        graphLayoutIcon: graphLayoutIcon.DOM,
        verticalIcon: verticalIcon.DOM,
        horizontalIcon: horizontalIcon.DOM,
      }),
      generateTestId(sources.testid)
    ),
    state: xs.merge(initialReducer$, reducer$),
  };
};
