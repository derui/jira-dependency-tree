import run from "@cycle/run";
import { jsx, VNode } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
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
import { HTTPSource, makeHTTPDriver, RequestInput } from "@cycle/http";
import { JiraLoader } from "./components/jira-loader";
import { env } from "./env";

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
  HTTP: HTTPSource;
};

type MainSinks = {
  DOM: Stream<VNode>;
  state: Stream<Reducer<MainState>>;
  issueGraph: Stream<IssueGraphSink>;
  HTTP: Stream<RequestInput>;
};

type MainState = {
  data: {
    issues: Issue[];
    project: Project | undefined;
  };
  setting: Setting;
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
    props: sources.state.stream.map<ProjectInformationProps>(({ data }) => ({ project: data.project })),
  });

  const credential$ = sources.state.stream.map((v) => v.setting.toCredential()).filter(filterUndefined);
  const jiraLoaderSinks = isolate(JiraLoader, { HTTP: "jiraLoader" })({
    HTTP: sources.HTTP,
    issueEvents: xs.combine(projectInformationSink.value, credential$).map(([projectKey, credential]) => {
      return {
        env: env,
        credential,
        projectKey,
      };
    }),
    projectEvents: xs.combine(projectInformationSink.value, credential$).map(([projectKey, credential]) => {
      return {
        env: env,
        credential,
        projectKey,
      };
    }),
  });

  const userConfiguration$ = userConfigurationSink.DOM;
  const projectInformation$ = projectInformationSink.DOM;

  const vnode$ = xs.combine(userConfiguration$, projectInformation$).map(([userConfiguration, projectInformation]) => (
    <div class={{ "app-root": true }}>
      {userConfiguration}
      {projectInformation}
    </div>
  ));

  const issueGraph$ = xs
    .combine(
      sources.state.stream.map(({ data }) => data.issues),
      sources.state.stream.map(({ data }) => data.project).filter(filterUndefined),
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
    return { data: { issues, project }, setting: settingFactory({}) };
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

  const jiraLoaderReducer$ = jiraLoaderSinks.state.map((v) => {
    return function (prevState?: MainState) {
      if (!prevState) return undefined;
      const data = v(prevState.data);

      return produce(prevState, (draft) => {
        draft.data.issues = data?.issues ?? [];
        draft.data.project = data?.project;
      });
    };
  });

  return {
    DOM: vnode$,
    state: xs.merge(initialReducer$, environmentReducer$, jiraLoaderReducer$),
    issueGraph: issueGraph$,
    HTTP: jiraLoaderSinks.HTTP,
  };
};

run(withState(main), {
  DOM: makeDOMDriver("#root"),
  issueGraph: makeIssueGraphDriver("#root"),
  panZoom: makePanZoomDriver("#root"),
  HTTP: makeHTTPDriver(),
});
