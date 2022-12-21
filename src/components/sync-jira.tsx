import { jsx, VNode } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import xs, { MemoryStream, Stream } from "xstream";
import isolate from "@cycle/isolate";
import { Icon, IconProps } from "./atoms/icon";
import {
  ComponentSink,
  ComponentSource,
  AsNodeStream,
  classes,
  domSourceOf,
  generateTestId,
  mergeNodes,
} from "@/components/helper";
import { LoaderState, LoaderStatus } from "@/type";

export interface SyncJiraProps {
  status: LoaderState;
  setupFinished: boolean;
}

export type SyncJiraState = LoaderState;

export type SyncJiraEvent = "REQUEST";

export interface SyncJiraSources extends ComponentSource {
  props: MemoryStream<SyncJiraProps>;
}

export interface SyncJiraSinks extends ComponentSink<"DOM"> {
  value: Stream<SyncJiraEvent>;
}

const intent = (sources: SyncJiraSources) => {
  const clicked$ = domSourceOf(sources).select("button").events("click").mapTo(true);
  return { props$: sources.props, clicked$ };
};

const model = (actions: ReturnType<typeof intent>) => {
  return actions.props$.map(({ status, setupFinished }) => {
    return {
      allowSync: status === LoaderStatus.COMPLETED && setupFinished,
      syncing: status === LoaderStatus.LOADING && setupFinished,
    };
  });
};

const Styles = {
  root: classes("flex", "justify-center", "relative", "w-12"),
  main: classes("outline-none", "bg-white", "inline-block", "rounded", "cursor-pointer"),
  icon: (syncing: boolean) => {
    return syncing ? classes("animate-spin") : {};
  },
};

const view = (
  state$: ReturnType<typeof model>,
  nodes$: AsNodeStream<["icon"]>,
  gen: ReturnType<typeof generateTestId>
) => {
  return xs.combine(state$, nodes$).map(([{ allowSync }, { icon }]) => {
    return (
      <div class={Styles.root} dataset={{ testid: gen("root") }}>
        <button class={Styles.main} attrs={{ disabled: !allowSync }} dataset={{ testid: gen("button") }}>
          {icon}
        </button>
      </div>
    );
  });
};

export const SyncJira = (sources: SyncJiraSources): SyncJiraSinks => {
  const actions = intent(sources);
  const state$ = model(actions);

  const icon = isolate(Icon, { "*": "icon" })({
    ...sources,
    testid: "sync",
    props: state$.map<IconProps>(({ syncing }) => {
      return {
        type: "refresh",
        size: "l",
        style: Styles.icon(syncing),
        color: "complement",
      };
    }),
  });

  const value$ = actions.clicked$.mapTo<SyncJiraEvent>("REQUEST");

  return {
    DOM: view(state$, mergeNodes({ icon }), generateTestId(sources.testid)),
    value: value$,
  };
};
