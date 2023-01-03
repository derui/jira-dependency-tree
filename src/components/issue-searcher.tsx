import { jsx } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import isolate from "@cycle/isolate";
import { Reducer, StateSource } from "@cycle/state";
import xs, { Stream } from "xstream";
import { Input, InputProps, InputSinks } from "./atoms/input";
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
  root: classes("flex", "flex-col", "items-center", "justify-center"),
  opener: classes("flex-none", "w-6", "h-6"),
  cancel: (status: Status) => {
    return {
      ...classes("flex-none", "w-6", "h-6"),
      ...(status === "Searched" || status === "Searching" ? classes("visible") : {}),
    };
  },
  inputWrapper: (status: Status) => {
    return {
      ...classes("flex-1"),
      ...(status === "Searching" ? classes("w-96") : classes("w-0")),
    };
  },
};

const view = (state$: Stream<State>, nodes$: AsNodeStream<["input", "opener", "cancel"]>, gen: TestIdGenerator) => {
  return xs.combine(state$, nodes$).map(([state, nodes]) => {
    return (
      <div class={Styles.root} dataset={{ testid: gen("root") }}>
        <span class={Styles.opener}>
          <button testid={{ testid: gen("opener") }}>{nodes.opener}</button>
        </span>
        <span class={Styles.inputWrapper(state.status)}>{nodes.input}</span>
        <span class={Styles.cancel(state.status)}>
          <button testid={{ testid: gen("cancel") }}>{nodes.cancel}</button>
        </span>
      </div>
    );
  });
};

const reducer = (sources: Sources, input: InputSinks) => {
  const openerClicked$ = domSourceOf(sources).select("[data-id=opener]").events("click");
  const cancelClicked$ = domSourceOf(sources).select("[data-id=cancel]").events("click");

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

  const cancelReducer$ = cancelClicked$.map(
    simpleReduce<State, unknown>((draft) => {
      draft.term = "";
    }),
  );

  const issuesReducer$ = sources.props.issues.map(
    simpleReduce<State, Issue[]>((draft, issues) => {
      draft.issues = issues;
      draft.term = "";
      draft.searchedIssues = [];
    }),
  );

  const inputReducer$ = input.input.map(
    simpleReduce<State, string>((draft, term) => {
      if (draft.status === "Searching") {
        draft.term = term;
        draft.searchedIssues = draft.issues
          .filter((issue) => issue.key.includes(term) || issue.summary.includes(term))
          .map((issue) => issue.key);
      }
    }),
  );

  const focusOutReducer$ = input.keypress
    .filter((key) => key === "Escape")
    .map(
      simpleReduce<State, unknown>((draft) => {
        if (draft.status === "Searching") {
          draft.status = "Searched";
        }
      }),
    );

  return xs.merge(initialReducer$, openReducer$, cancelReducer$, issuesReducer$, inputReducer$, focusOutReducer$);
};

export const IssueSearcher = (sources: Sources): Sinks => {
  const gen = generateTestId(sources.testid);
  const input = isolate(
    Input,
    "input",
  )({
    ...sources,
    testid: gen("input"),
    props: sources.state.select<State["term"]>("status").stream.map<InputProps>((term) => {
      return {
        value: term,
        placeholder: "Search term",
      };
    }),
  });

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
    DOM: view(sources.state.stream, mergeNodes({ input, opener, cancel }), gen),
    state: reducer(sources, input),
    value: xs.of<IssueKey[]>([]),
  };
};
