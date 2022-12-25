import { jsx } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import xs, { Stream } from "xstream";
import isolate from "@cycle/isolate";
import { Reducer, StateSource } from "@cycle/state";
import { Icon, IconProps } from "./atoms/icon";
import { JiraIssueLoader } from "./jira-issue-loader";
import {
  ComponentSink,
  ComponentSource,
  AsNodeStream,
  classes,
  domSourceOf,
  generateTestId,
  mergeNodes,
  simpleReduce,
} from "@/components/helper";
import { ApiCredential, SearchCondition } from "@/model/event";
import { Issue } from "@/model/issue";

export interface Props {
  credential: Stream<ApiCredential>;
  condition: Stream<SearchCondition>;
}

type SyncState = "loading" | "completed" | "notPrepared";

export interface State {
  syncState: SyncState;
  apiCredential?: ApiCredential;
  condition?: SearchCondition;
}

interface Sources extends ComponentSource {
  props: Props;
  state: StateSource<State>;
}

export interface Sinks extends ComponentSink<"DOM">, ComponentSink<"HTTP"> {
  value: Stream<Issue[]>;
  state: Stream<Reducer<State>>;
}

const intent = (sources: Sources) => {
  const clicked$ = domSourceOf(sources).select("button").events("click").mapTo(true);
  return { clicked$ };
};

const Styles = {
  root: classes("flex", "justify-center", "relative", "w-12"),
  main: classes("outline-none", "bg-white", "inline-block", "rounded", "cursor-pointer"),
  icon: (syncing: boolean) => {
    return syncing ? classes("animate-spin") : {};
  },
};

const view = (state$: Stream<State>, nodes$: AsNodeStream<["icon"]>, gen: ReturnType<typeof generateTestId>) => {
  return xs.combine(state$, nodes$).map(([{ syncState: syncState }, { icon }]) => {
    return (
      <div class={Styles.root} dataset={{ testid: gen("root") }}>
        <button
          class={{ ...Styles.main, "--loading": syncState === "loading" }}
          attrs={{ disabled: syncState !== "completed" }}
          dataset={{ testid: gen("button") }}
        >
          {icon}
        </button>
      </div>
    );
  });
};

export const SyncIssueButton = (sources: Sources): Sinks => {
  const actions = intent(sources);

  const icon = Icon({
    ...sources,
    testid: "sync",
    props: sources.state.stream.map<IconProps>(({ syncState }) => {
      return {
        type: "refresh",
        size: "l",
        style: Styles.icon(syncState === "loading"),
        color: "complement",
      };
    }),
  });

  const loader = isolate(
    JiraIssueLoader,
    "jiraIssueLoader",
  )({
    ...sources,
    props: {
      request: sources.state.stream
        .map(({ syncState, apiCredential, condition }) => {
          if (!apiCredential || !condition || syncState !== "loading") {
            return xs.never();
          }

          return xs.of({
            credential: apiCredential,
            condition,
          });
        })
        .flatten(),
    },
  });

  const initialReducer$ = xs.of<Reducer<State>>(() => {
    return {
      syncState: "notPrepared",
    };
  });

  const clickReducer$ = actions.clicked$.map(
    simpleReduce<State, unknown>((draft) => {
      if (draft.apiCredential && draft.condition) {
        draft.syncState = "loading";
      }
    }),
  );

  const propsReducer$ = xs.combine(sources.props.condition, sources.props.credential).map(
    simpleReduce<State, [SearchCondition, ApiCredential]>((draft, [condition, apiCredential]) => {
      draft.condition = condition;
      draft.apiCredential = apiCredential;

      if (draft.syncState === "notPrepared") {
        draft.syncState = "loading";
      }
    }),
  );

  const valueReducer$ = loader.issues.map(
    simpleReduce<State, unknown>((draft) => {
      draft.syncState = "completed";
    }),
  );

  return {
    DOM: view(sources.state.stream, mergeNodes({ icon }), generateTestId(sources.testid)),
    HTTP: xs.merge(loader.HTTP),
    value: loader.issues,
    state: xs.merge(initialReducer$, clickReducer$, propsReducer$, valueReducer$),
  };
};
