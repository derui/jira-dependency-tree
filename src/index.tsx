import run from "@cycle/run";
import { jsx, VNode } from "snabbdom"; // eslint-disable-line unused-imports/no-unused-imports
import { Project, projectFactory } from "./model/project";
import { DOMSource, makeDOMDriver } from "@cycle/dom";
import { Reducer, StateSource, withState } from "@cycle/state";
import { IssueGraphSink, makeIssueGraphDriver } from "./drivers/issue-graph";
import xs, { Stream } from "xstream";
import { Issue } from "./model/issue";
import { makePanZoomDriver, PanZoomSource } from "./drivers/pan-zoom";
import isolate from "@cycle/isolate";
import { Setting, settingFactory } from "./model/setting";
import produce from "immer";
import { UserConfiguration, UserConfigurationProps } from "./components/user-configuration";
import { ProjectInformation, ProjectInformationProps } from "./components/project-information";
import { filterUndefined } from "./util/basic";
import { makeJiraLoaderDriver, JiraLoaderSinks, JiraLoaderSources } from "./drivers/jira-loader";

const project = projectFactory({
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
  jira: JiraLoaderSources;
};

type MainSinks = {
  DOM: Stream<VNode>;
  state: Stream<Reducer<MainState>>;
  issueGraph: Stream<IssueGraphSink>;
  jira: Stream<JiraLoaderSinks>;
};

type MainState = {
  issues: Issue[];
  project: Project | undefined;
  setting: Setting;
};

const authorize = function authorize(sources: MainSources) {
  sources.state.stream
    .map((v) => v.setting)
    .filter((e) => e.isSetupFinished())
    .subscribe({
      next(e) {
        sources.jira.authorize({
          host: e.userDomain!,
          user: e.credentials.email!,
          credential: e.credentials.jiraToken!,
        });
      },
    });
};

const main = function main(sources: MainSources): MainSinks {
  const userConfigurationSink = isolate(UserConfiguration, { DOM: "userConfiguration" })({
    DOM: sources.DOM,
    props: sources.state.stream.map<UserConfigurationProps>(({ setting: environment }) => ({
      setupFinished: environment.isSetupFinished(),
    })),
  });
  const projectInformationSink = isolate(ProjectInformation, { DOM: "projectInformation" })({
    DOM: sources.DOM,
    props: sources.state.stream.map<ProjectInformationProps>(({ project }) => ({ project })),
  });

  const userConfiguration$ = userConfigurationSink.DOM;
  const projectInformation$ = projectInformationSink.DOM;

  const vnode$ = xs.combine(userConfiguration$, projectInformation$).map(([userConfiguration, projectInformation]) => (
    <div class={{ "app-root": true }}>
      {userConfiguration}
      {projectInformation}
    </div>
  ));

  authorize(sources);

  const issueGraph$ = xs
    .combine(
      sources.state.stream.map(({ issues }) => issues),
      sources.state.stream.map(({ project }) => project).filter(filterUndefined),
      sources.panZoom.state
    )
    .map(([issues, project, panZoomState]) => {
      return {
        panZoom: panZoomState,
        issues,
        project,
      };
    });

  const initialReducer$ = xs.of(() => {
    return { issues, project, setting: settingFactory({}) };
  });

  const environmentReducer$ = userConfigurationSink.value.map(
    (v) =>
      function (prevState?: MainState) {
        if (!prevState) return undefined;

        return produce(prevState, (draft) => {
          draft.setting = draft.setting.applyCredentials(v.jiraToken, v.email).applyUserDomain(v.userDomain);
        });
      }
  );

  return {
    DOM: vnode$,
    state: xs.merge(initialReducer$, environmentReducer$),
    issueGraph: issueGraph$,
    jira: projectInformationSink.jira,
  };
};

run(withState(main), {
  DOM: makeDOMDriver("#root"),
  issueGraph: makeIssueGraphDriver("#root"),
  panZoom: makePanZoomDriver("#root"),
  jira: makeJiraLoaderDriver(),
});
