import run from "@cycle/run";
import { jsx, VNode } from "snabbdom"; // eslint-disable-line unused-imports/no-unused-imports
import { Project } from "./model/project";
import { DOMSource, makeDOMDriver } from "@cycle/dom";
import { Reducer, StateSource, withState } from "@cycle/state";
import { IssueGraphSink, makeIssueGraphDriver } from "./drivers/issue-graph";
import xs, { Stream } from "xstream";
import { Issue } from "./model/issue";
import { makePanZoomDriver, PanZoomSource } from "./drivers/pan-zoom";

const project = new Project({
  id: "key",
  key: "key",
  name: "project",
  statuses: [
    {
      name: "Done",
      id: "1",
      categoryId: "1",
    },
    {
      name: "In progress",
      id: "2",
      categoryId: "2",
    },
    {
      name: "TODO",
      id: "3",
      categoryId: "3",
    },
  ],
  issueTypes: [
    {
      id: "1",
      name: "Story",
      avatarUrl: "",
    },
  ],
  statusCategories: [
    {
      id: "1",
      name: "Done",
      colorName: "green",
    },
    {
      id: "2",
      name: "In progress",
      colorName: "blue",
    },
    {
      id: "3",
      name: "TODO",
      colorName: "yellow",
    },
  ],
});

const issues = [
  {
    key: "EX-1",
    summary: "summary of ex-1",
    description: "",
    statusId: "2",
    typeId: "2",
    selfUrl: "http://localhost/ex-1",
    outwardIssueKeys: ["EX-2", "EX-4"],
  },

  {
    key: "EX-2",
    summary: "summary of ex-2",
    description: "",
    statusId: "1",
    typeId: "2",
    selfUrl: "http://localhost/ex-2",
    outwardIssueKeys: ["EX-3"],
  },
  {
    key: "EX-3",
    summary: "summary of ex-3",
    description: "",
    statusId: "3",
    typeId: "2",
    selfUrl: "http://localhost/ex-3",
    outwardIssueKeys: ["EX-4"],
  },
  {
    key: "EX-4",
    summary: "summary of ex-4",
    description: "",
    statusId: "1",
    typeId: "2",
    selfUrl: "http://localhost/ex-4",
    outwardIssueKeys: [],
  },
  {
    key: "EX-5",
    summary: "summary of ex-5",
    description: "",
    statusId: "1",
    typeId: "2",
    selfUrl: "http://localhost/ex-5",
    outwardIssueKeys: ["EX-3"],
  },
];

type MainSources = {
  DOM: DOMSource;
  state: StateSource<MainState>;
  panZoom: PanZoomSource;
};

type MainSinks = {
  DOM: Stream<VNode>;
  state: Stream<Reducer<MainState>>;
  issueGraph: Stream<IssueGraphSink>;
};

type MainState = {
  issues: Issue[];
  project: Project;
};

const main = function main(sources: MainSources): MainSinks {
  const vnode$ = xs.of(<div></div>);

  const reducer$ = xs.of<Reducer<MainState>>(() => {
    return { issues, project };
  });

  const issueGraph$ = xs.combine(sources.state.stream, sources.panZoom.state$).map(([state, panZoomState]) => {
    return {
      panZoom: panZoomState,
      issues: state.issues,
      project: state.project,
    };
  });

  return {
    DOM: vnode$,
    state: reducer$,
    issueGraph: issueGraph$,
  };
};

run(withState(main), {
  DOM: makeDOMDriver("#app"),
  issueGraph: makeIssueGraphDriver("#svg"),
  panZoom: makePanZoomDriver("#svg"),
});
