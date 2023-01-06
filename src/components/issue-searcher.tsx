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

type Status = "Searching" | "Prepared" | "BeforePrepared";
type IssueKey = string;

interface State {
  term: string;
  issues: Issue[];
  status: Status;
  searchedIssues: Issue[];
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
  value: Stream<IssueKey>;
}

const Styles = {
  root: classes("flex", "flex-col", "bg-white", "rounded", "px-3", "mr-3", "shadow-md", "max-w-sm", "relative"),
  opener: classes("flex-none", "w-6", "h-6", "items-center", "justify-center", "flex"),
  input: classes("flex-[1_1_60%]", "w-full", "outline-none", "pl-2"),
  cancel: (status: Status) => {
    return {
      ...classes("flex-none", "w-6", "h-6", "flex"),
      ...(status === "Searching" ? classes("visible") : classes("invisible")),
    };
  },
  inputWrapper: (status: Status) => {
    return {
      ...classes("flex-1", "overflow-hidden", "transition-width"),
      ...(status === "Searching" ? classes("w-64") : classes("w-0")),
    };
  },
  searcher: classes("h-12", "flex", "items-center", "justify-center"),
  issue: classes(
    "flex",
    "flex-col",
    "align-center",
    "border-b",
    "last:border-b-0",
    "border-b-secondary1-300/50",
    "transition",
    "py-2",
    "px-2",
    "cursor-pointer",
    "hover:text-secondary1-300",
    "hover:bg-secondary1-200/10",
  ),
  issueKey: classes("text-gray", "flex-none"),
  issueSummary: classes("font-sm", "flex-none", "w-full", "overflow-hidden", "text-ellipsis", "whitespace-nowrap"),
  issueList: (haveIssues: boolean) => {
    return {
      ...classes(
        "max-h-64",
        "overflow-y-auto",
        "shadow-lg",
        "p-2",
        "mt-2",
        "flex",
        "flex-col",
        "absolute",
        "top-12",
        "right-0",
        "w-96",
        "bg-white",
      ),
      ...(haveIssues ? classes() : classes("hidden")),
    };
  },
};

const view = (state$: Stream<State>, nodes$: AsNodeStream<["opener", "cancel"]>, gen: TestIdGenerator) => {
  return xs.combine(state$, nodes$).map(([state, nodes]) => {
    const issueList = state.searchedIssues.map((issue) => (
      <li class={Styles.issue} dataset={{ testid: gen("issue") }}>
        <span class={Styles.issueKey}>{issue.key}</span>
        <span class={Styles.issueSummary}>{issue.summary}</span>
      </li>
    ));

    return (
      <div class={Styles.root} dataset={{ testid: gen("root") }}>
        <div class={Styles.searcher}>
          <span class={Styles.opener} dataset={{ id: gen("opener") }}>
            <button dataset={{ testid: gen("opener") }}>{nodes.opener}</button>
          </span>
          <span class={Styles.inputWrapper(state.status)} dataset={{ testid: gen("input-wrapper") }}>
            <input
              class={Styles.input}
              props={{ value: state.term }}
              attrs={{ type: "text", placeholder: "Search term" }}
              dataset={{ testid: gen("input") }}
            ></input>
          </span>
          <span class={Styles.cancel(state.status)}>
            <button dataset={{ id: "cancel", testid: gen("cancel") }}>{nodes.cancel}</button>
          </span>
        </div>
        <ul class={Styles.issueList(issueList.length > 0)} dataset={{ testid: gen("issue-list") }}>
          {issueList}
        </ul>
      </div>
    );
  });
};

const reducer = (sources: Sources) => {
  const openerClicked$ = domSourceOf(sources).select("[data-id=opener]").events("click");
  const cancelClicked$ = domSourceOf(sources).select("[data-id=cancel]").events("click");
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
      if (draft.status === "Prepared") {
        draft.status = "Searching";
      }
    }),
  );

  const cancelReducer$ = cancelClicked$.map(
    simpleReduce<State, unknown>((draft) => {
      draft.term = "";
      draft.searchedIssues = [];

      if (draft.status !== "BeforePrepared") {
        draft.status = "Prepared";
      }
    }),
  );

  const issuesReducer$ = sources.props.issues.map(
    simpleReduce<State, Issue[]>((draft, issues) => {
      draft.issues = issues;
      draft.term = "";
      draft.searchedIssues = [];

      if (draft.status === "BeforePrepared") {
        draft.status = "Prepared";
      }
    }),
  );

  const inputReducer$ = input$.map(
    simpleReduce<State, string>((draft, term) => {
      if (draft.status === "Searching") {
        draft.term = term;
        draft.searchedIssues = draft.issues.filter((issue) => issue.key.includes(term) || issue.summary.includes(term));
      }
    }),
  );

  return xs.merge(initialReducer$, openReducer$, cancelReducer$, issuesReducer$, inputReducer$);
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
        active: status === "Searching",
      };
    }),
  });

  const cancel = Icon({
    ...sources,
    testid: gen("cancel-icon"),
    props: sources.state.select<State["term"]>("term").stream.map<IconProps>((term) => {
      return {
        type: "x",
        color: "primary",
        active: !!term,
      };
    }),
  });

  return {
    DOM: view(sources.state.stream, mergeNodes({ opener, cancel }), gen),
    state: reducer(sources),
    value: xs.of<IssueKey>(""),
  };
};
