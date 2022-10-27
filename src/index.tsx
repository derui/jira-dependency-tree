import run from "@cycle/run";
import { jsx, VNode } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { Project } from "./model/project";
import { DOMSource, makeDOMDriver } from "@cycle/dom";
import { Reducer, StateSource, withState } from "@cycle/state";
import { IssueGraphSink, makeIssueGraphDriver } from "./drivers/issue-graph";
import xs, { Stream } from "xstream";
import { Issue } from "./model/issue";
import { makePanZoomDriver, PanZoomSource } from "./drivers/pan-zoom";
import isolate, { Component } from "@cycle/isolate";
import { Setting, SettingArgument, settingFactory } from "./model/setting";
import produce from "immer";
import { UserConfiguration, UserConfigurationProps } from "./components/user-configuration";
import { ProjectInformation, ProjectInformationProps } from "./components/project-information";
import { filterNull, filterUndefined } from "./util/basic";
import { HTTPSource, makeHTTPDriver, RequestInput } from "@cycle/http";
import { JiraLoader } from "./components/jira-loader";
import { env } from "./env";
import { ZoomSlider } from "./components/zoom-slider";
import { makeStorageDriver, StorageSink, StorageSource } from "./drivers/storage";
import equal from "fast-deep-equal/es6";
import {
  SyncJiraState as SyncJiraState,
  SyncJira,
  SyncJiraProps,
  SyncJiraSinks,
  SyncJiraSources,
} from "./components/sync-jira";
import { LoaderStatus } from "./type";
import { Events } from "./model/event";

type MainSources = {
  DOM: DOMSource;
  state: StateSource<MainState>;
  panZoom: PanZoomSource;
  HTTP: HTTPSource;
  STORAGE: StorageSource;
};

type MainSinks = {
  DOM: Stream<VNode>;
  state: Stream<Reducer<MainState>>;
  issueGraph: Stream<IssueGraphSink>;
  HTTP: Stream<RequestInput>;
  STORAGE: Stream<StorageSink>;
};

type MainState = {
  data: {
    issues: Issue[];
    project: Project | undefined;
  };
  projectKey: string | undefined;
  setting: Setting;
} & { jiraSync: SyncJiraState };

const jiraLoader = function jiraLoader(sources: MainSources) {
  const credential$ = sources.state
    .select<MainState["setting"]>("setting")
    .stream.map((v) => v.toCredential())
    .filter(filterUndefined)
    .remember();
  const project$ = sources.state
    .select<MainState["projectKey"]>("projectKey")
    .stream.filter(filterUndefined)
    .remember();
  const sync$ = sources.state
    .select<MainState["jiraSync"]>("jiraSync")
    .stream.filter((v) => v === LoaderStatus.LOADING)
    .map(() =>
      xs.combine(project$, credential$).map<Events>(([projectKey, credential]) => {
        return {
          kind: "SyncIssuesRequest",
          env: env,
          credential,
          projectKey: projectKey,
        };
      })
    )
    .flatten();
  const requestChangeEvent$ = xs.combine(project$, credential$).map<Events>(([projectKey, credential]) => {
    return {
      kind: "GetWholeDataRequest",
      env: env,
      credential,
      projectKey: projectKey,
    };
  });

  return isolate(JiraLoader, { HTTP: "jiraLoader" })({
    HTTP: sources.HTTP,
    events: xs.merge(sync$, requestChangeEvent$),
  });
};

const main = function main(sources: MainSources): MainSinks {
  const userConfigurationSink = isolate(UserConfiguration, { DOM: "userConfiguration" })({
    DOM: sources.DOM,
    props: sources.state.stream.map<UserConfigurationProps>(({ setting: environment }) => ({
      setting: environment,
      setupFinished: environment.isSetupFinished(),
    })),
  });
  const projectInformationSink = isolate(ProjectInformation, { DOM: "projectInformation" })({
    DOM: sources.DOM,
    props: sources.state
      .select<MainState["data"]>("data")
      .select<MainState["data"]["project"]>("project")
      .stream.startWith(undefined)
      .map<ProjectInformationProps>((data) => ({ project: data })),
  });
  const jiraLoaderSink = jiraLoader(sources);
  const zoomSliderSink = isolate(ZoomSlider, { DOM: "zoomSlider" })({
    DOM: sources.DOM,
    props: sources.panZoom.state.map((v) => ({ zoom: v.zoomPercentage })),
  });

  const syncJiraSink = (isolate(SyncJira, { DOM: "syncJira" }) as Component<SyncJiraSources, SyncJiraSinks>)({
    DOM: sources.DOM,
    props: xs
      .combine(
        sources.state.select<MainState["setting"]>("setting").stream.map((v) => v.isSetupFinished()),
        sources.state.select<MainState["jiraSync"]>("jiraSync").stream.map((v) => v)
      )
      .map<SyncJiraProps>(([setupFinished, status]) => ({ setupFinished, status })),
  });

  const userConfiguration$ = userConfigurationSink.DOM;
  const projectInformation$ = projectInformationSink.DOM;
  const zoomSlider$ = zoomSliderSink.DOM;
  const syncJira$ = syncJiraSink.DOM;

  const vnode$ = xs
    .combine(userConfiguration$, projectInformation$, zoomSlider$, syncJira$)
    .map(([userConfiguration, projectInformation, zoomSlider, syncJira]) => (
      <div class={{ "app-root": true }}>
        {userConfiguration}
        {projectInformation}
        {syncJira}
        {zoomSlider}
      </div>
    ));

  const issueGraph$ = xs
    .combine(
      sources.state.stream.map(({ data }) => data.issues),
      sources.state.stream.map(({ data }) => data.project).filter(filterUndefined),
      sources.state.stream.map(({ setting }) => setting.layoutDirection),
      sources.panZoom.state
    )
    .map(([issues, project, layoutDirection, panZoomState]) => {
      return {
        panZoom: panZoomState,
        issues,
        project,
        layoutDirection,
      };
    });

  const storageReducer$ = sources.STORAGE.select<SettingArgument>("settings").map((v) => {
    return function (prevState?: MainState) {
      if (!prevState) return undefined;

      return produce(prevState, (draft) => {
        draft.setting = settingFactory(v);
      });
    };
  });

  const initialReducer$ = xs.of(() => {
    return {
      data: { issues: [], project: undefined },
      setting: settingFactory({}),
      jiraSync: LoaderStatus.COMPLETED,
      projectKey: undefined,
    };
  });

  const projectReducer$ = projectInformationSink.value.map(
    (v) =>
      function (prevState?: MainState) {
        if (!prevState) return undefined;

        return produce(prevState, (draft) => {
          draft.projectKey = v;
        });
      }
  );

  const environmentReducer$ = userConfigurationSink.value.map(
    (v) =>
      function (prevState?: MainState) {
        if (!prevState) return undefined;

        return produce(prevState, (draft) => {
          draft.setting = draft.setting.applyCredentials(v.jiraToken, v.email).applyUserDomain(v.userDomain);
        });
      }
  );

  const jiraLoaderReducer$ = jiraLoaderSink.state.map<Reducer<MainState>>((v) => {
    return function (prevState?: MainState) {
      if (!prevState) return undefined;
      const data = v(prevState.data);
      if (!data) return prevState;

      return produce(prevState, (draft) => {
        draft.data.issues = data?.issues ?? draft.data.issues;
        draft.data.project = data?.project ?? draft.data.project;
        draft.jiraSync = LoaderStatus.COMPLETED;
      });
    };
  });

  const storage$ = sources.state.stream
    .map((v) => v.setting)
    .fold<SettingArgument | null>((accum, v) => {
      if (!accum) {
        return v.toArgument();
      }

      const newArg = v.toArgument();
      return equal(newArg, accum) ? accum : newArg;
    }, null)
    .filter(filterNull)
    .map<StorageSink>((v) => ({ settings: v }));

  const syncjiraReducer$ = syncJiraSink.value.map(() => {
    return function name(prevState?: MainState) {
      if (!prevState) {
        return undefined;
      }

      return produce(prevState, (draft) => {
        draft.jiraSync = LoaderStatus.LOADING;
      });
    };
  });

  return {
    DOM: vnode$,
    state: xs.merge(
      initialReducer$,
      storageReducer$,
      environmentReducer$,
      jiraLoaderReducer$,
      syncjiraReducer$,
      projectReducer$
    ),
    issueGraph: issueGraph$,
    HTTP: xs.merge(jiraLoaderSink.HTTP),
    STORAGE: storage$,
  };
};

run(withState(main), {
  DOM: makeDOMDriver("#root"),
  issueGraph: makeIssueGraphDriver("#root"),
  panZoom: makePanZoomDriver("#root"),
  HTTP: makeHTTPDriver(),
  STORAGE: makeStorageDriver("jiraDependencyTree", localStorage),
});
