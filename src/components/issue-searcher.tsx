import { jsx } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { Reducer, StateSource } from "@cycle/state";
import xs, { Stream } from "xstream";
import {
  AsNodeStream,
  classes,
  ComponentSink,
  ComponentSource,
  domSourceOf,
  generateTestId,
  mergeNodes,
  simpleReduce,
  TestIdGenerator,
} from "./helper";
import { Icon, IconProps } from "./atoms/icon";
import { Issue } from "@/model/issue";

type Status = "Searching" | "Prepared" | "BeforePrepared" | "Searched";
type IssueKey = string;

interface State {
  term: string;
  issues: Issue[];
  status: Status;
  searchedIssues: IssueKey[];
}

interface Props {
  issues: Stream<Issue[]>;
}

interface Sources extends ComponentSource {
  props: Props;
  state: StateSource<State>;
}

interface Sinks extends ComponentSink<"DOM"> {
  state: Stream<Reducer<State>>;
  value: Stream<IssueKey[]>;
}

const Styles = {
  root: classes(
    "flex",
    "flex-row",
    "items-center",
    "justify-center",
    "bg-white",
    "rounded-full",
    "px-3",
    "mr-3",
    "shadow-md",
    "h-12",
  ),
  opener: classes("flex-none", "w-6", "h-6", "items-center", "justify-center", "flex"),
  input: classes("flex-[1_1_60%]", "w-full", "outline-none", "pl-2"),
  cancel: (status: Status) => {
    return {
      ...classes("flex-none", "w-6", "h-6", "flex"),
      ...(status === "Searched" || status === "Searching" ? classes("visible") : classes("invisible")),
    };
  },
  inputWrapper: (status: Status) => {
    return {
      ...classes("flex-1", "overflow-hidden", "transition-width"),
      ...(status === "Searching" ? classes("w-64") : classes("w-0")),
    };
  },
};

const view = (state$: Stream<State>, nodes$: AsNodeStream<["opener", "cancel"]>, gen: TestIdGenerator) => {
  return xs.combine(state$, nodes$).map(([state, nodes]) => {
    return (
      <div class={Styles.root} dataset={{ testid: gen("root") }}>
        <span class={Styles.opener} dataset={{ id: "opener" }}>
          <button dataset={{ testid: gen("opener") }}>{nodes.opener}</button>
        </span>
        <span class={Styles.inputWrapper(state.status)}>
          <input
            class={Styles.input}
            attrs={{ type: "text", value: state.term, placeholder: "Search term" }}
            dataset={{ testid: gen("input") }}
          ></input>
        </span>
        <span class={Styles.cancel(state.status)}>
          <button dataset={{ id: "cancel", testid: gen("cancel") }}>{nodes.cancel}</button>
        </span>
      </div>
    );
  });
};

const reducer = (sources: Sources) => {
  const openerClicked$ = domSourceOf(sources).select("[data-id=opener]").events("click");
  const cancelClicked$ = domSourceOf(sources).select("[data-id=cancel]").events("click");
  const keyPressed$ = domSourceOf(sources).select("input[type=text]").events("keypress");
  const blurred$ = domSourceOf(sources).select("input[type=text]").events("blur");
  const input$ = domSourceOf(sources)
    .select("input[type=text]")
    .events("input")
    .map((event) => (event.target as HTMLInputElement).value);

  const initialReducer$ = xs.of<Reducer<State>>(() => {
    return {
      term: "",
      status: "BeforePrepared",
      issues: [],
      searchedIssues: [],
    };
  });

  const openReducer$ = xs.merge(openerClicked$.mapTo(true)).map(
    simpleReduce<State, unknown>((draft) => {
      draft.status = "Searching";
    }),
  );

  const enterPressedReducer$ = keyPressed$
    .filter((e) => e.key === "Enter")
    .map(
      simpleReduce<State>((draft) => {
        draft.status = "Searched";
      }),
    );

  const cancelReducer$ = cancelClicked$.map(
    simpleReduce<State, unknown>((draft) => {
      draft.term = "";

      if (draft.status === "Searched") {
        draft.status = "Prepared";
      }
    }),
  );

  const issuesReducer$ = sources.props.issues.map(
    simpleReduce<State, Issue[]>((draft, issues) => {
      draft.issues = issues;
      draft.term = "";
      draft.searchedIssues = [];
    }),
  );

  const inputReducer$ = input$.map(
    simpleReduce<State, string>((draft, term) => {
      if (draft.status === "Searching") {
        draft.term = term;
        draft.searchedIssues = draft.issues
          .filter((issue) => issue.key.includes(term) || issue.summary.includes(term))
          .map((issue) => issue.key);
      }
    }),
  );

  const focusOutReducer$ = xs
    .merge(
      keyPressed$.filter((event) => event.key === "Escape"),
      blurred$,
    )
    .map(
      simpleReduce<State>((draft) => {
        if (draft.status === "Searching" && !!draft.term) {
          draft.status = "Searched";
        } else {
          draft.status = "Prepared";
        }
      }),
    );

  return xs.merge(
    initialReducer$,
    openReducer$,
    cancelReducer$,
    issuesReducer$,
    inputReducer$,
    focusOutReducer$,
    enterPressedReducer$,
  );
};

export const IssueSearcher = (sources: Sources): Sinks => {
  const gen = generateTestId(sources.testid);

  const opener = Icon({
    ...sources,
    testid: gen("opener-icon"),
    props: sources.state.select<State["status"]>("status").stream.map<IconProps>((status) => {
      return {
        type: "search",
        color: "complement",
        active: status === "Searched" || status === "Searching",
      };
    }),
  });

  const cancel = Icon({
    ...sources,
    testid: gen("cancel-icon"),
    props: sources.state.select<State["status"]>("status").stream.map<IconProps>((status) => {
      return {
        type: "x",
        color: "primary",
        active: status === "Searched",
      };
    }),
  });

  return {
    DOM: view(sources.state.stream, mergeNodes({ opener, cancel }), gen),
    state: reducer(sources),
    value: xs.of<IssueKey[]>([]),
  };
};
