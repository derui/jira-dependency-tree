import { jsx } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { Reducer, StateSource } from "@cycle/state";
import xs, { MemoryStream, Stream } from "xstream";
import { Icon, IconProps } from "./atoms/icon";
import { AsNodeStream, ComponentSource, domSourceOf, mergeNodes, simpleReduce } from "./helper";
import { GraphLayout } from "@/issue-graph/type";
import { classes, generateTestId, ComponentSink } from "@/components/helper";

export interface SideToolbarState {
  graphLayout: GraphLayout;
  opened: boolean;
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

  return { layouterClicked$, verticalClicked$, horizontalClicked$ };
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
  state$: Stream<SideToolbarState>,
  nodes$: AsNodeStream<["graphLayoutIcon", "verticalIcon", "horizontalIcon"]>,
  gen: ReturnType<typeof generateTestId>
) => {
  return xs.combine(state$, nodes$).map(([{ graphLayout, opened }, nodes]) => {
    return (
      <ul class={Styles.root}>
        <li class={Styles.graphLayout} dataset={{ testid: gen("graph-layout"), id: "opener" }}>
          {nodes.graphLayoutIcon}
          <div class={{ ...Styles.graphLayouter(opened), "--opened": opened }} dataset={{ testid: gen("layouter") }}>
            <span
              class={{ ...Styles.iconButton, "--selected": graphLayout === GraphLayout.Horizontal }}
              dataset={{ testid: gen("horizontal"), id: "horizontal" }}
            >
              {nodes.horizontalIcon}
            </span>
            <span
              class={{ ...Styles.iconButton, "--selected": graphLayout === GraphLayout.Vertical }}
              dataset={{ testid: gen("vertical"), id: "vertical" }}
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

  const initialReducer$ = sources.props.map((graphLayout) => {
    return () => {
      return {
        graphLayout,
        opened: false,
      };
    };
  });

  const layouterReducer$ = xs
    .merge(
      actions.layouterClicked$.mapTo(["layouter"] as const),
      actions.verticalClicked$.map((v) => ["layout", v] as const),
      actions.horizontalClicked$.map((v) => ["layout", v] as const)
    )
    .map(
      simpleReduce((draft: SideToolbarState, [value, layout]) => {
        switch (value) {
          case "layouter":
            draft.opened = !draft.opened;
            break;
          case "layout":
            draft.opened = false;
            draft.graphLayout = layout;
            break;
        }
      })
    );

  return {
    DOM: view(
      sources.state.stream,
      mergeNodes({
        graphLayoutIcon,
        verticalIcon,
        horizontalIcon,
      }),
      generateTestId(sources.testid)
    ),
    state: xs.merge(initialReducer$, layouterReducer$),
  };
};
