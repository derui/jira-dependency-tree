import run from "@cycle/run";
import { jsx, VNode } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { Project } from "./model/project";
import { DOMSource, makeDOMDriver } from "@cycle/dom";
import { Reducer, StateSource, withState } from "@cycle/state";
import { IssueGraphSink, makeIssueGraphDriver } from "./drivers/issue-graph";
import xs, { Stream } from "xstream";
import flatten from "xstream/extra/flattenConcurrently";
import { Issue } from "./model/issue";
import { makePanZoomDriver, PanZoomSource } from "./drivers/pan-zoom";
import isolate, { Component } from "@cycle/isolate";
import { Setting, SettingArgument, settingFactory } from "./model/setting";
import produce from "immer";
import { UserConfiguration, UserConfigurationProps } from "./components/user-configuration";
import { ProjectInformation, ProjectInformationProps } from "./components/project-information";
import { filterNull, filterUndefined } from "./util/basic";
import { HTTPSource, makeHTTPDriver, RequestInput } from "@cycle/http";
import { JiraLoader, JiraLoaderSinks } from "./components/jira-loader";
import { env } from "./env";
import { ZoomSlider } from "./components/zoom-slider";
import { makeStorageDriver, StorageSink, StorageSource } from "./drivers/storage";
import equal from "fast-deep-equal/es6";
import { SyncJira, SyncJiraProps, SyncJiraSinks, SyncJiraSources } from "./components/sync-jira";
import { LoaderState, LoaderStatus } from "./type";
import { Events } from "./model/event";
import { SideToolbar, SideToolbarState } from "./components/side-toolbar";
import { GraphLayout } from "./issue-graph/type";
import { ProjectToolbar, ProjectToolbarState } from "./components/project-toolbar";
import { Suggestion, suggestionFactory } from "./model/suggestion";
import { classes } from "./components/helper";

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
    project?: Project;
    suggestion?: Suggestion;
  };
  projectKey: string | undefined;
  setting: Setting;
  loading: LoaderState;
} & { sideToolbar?: SideToolbarState } & { projectToolbar?: ProjectToolbarState };

type Storage = SettingArgument & { graphLayout?: GraphLayout };

const Styles = {
  topToolbar: classes("absolute", "w-full", "grid", "grid-cols-top-toolbar", "grid-rows-1"),
};

const jiraLoader = (sources: MainSources, syncJiraSync: SyncJiraSinks): JiraLoaderSinks => {
  const credential$ = sources.state
    .select<MainState["setting"]>("setting")
    .stream.map((v) => v.toCredential())
    .filter(filterUndefined)
    .remember();

  const project$ = sources.state
    .select<MainState["projectKey"]>("projectKey")
    .stream.filter(filterUndefined)
    .remember();

  const condition$ = sources.state
    .select<MainState["projectToolbar"]>("projectToolbar")
    .stream.map((v) => v?.currentSearchCondition)
    .remember();

  const sync$ = syncJiraSync.value
    .map(() =>
      xs
        .combine(project$, credential$, condition$)
        .map<Events>(([projectKey, credential, condition]) => {
          return {
            kind: "SyncIssuesRequest",
            env: env,
            credential,
            projectKey: projectKey,
            condition,
          };
        })
        .take(1)
    )
    .flatten();

  const lastTerm$ = sources.state
    .select<MainState["projectToolbar"]>("projectToolbar")
    .stream.map((v) => v?.lastTerm)
    .filter(filterUndefined)
    .filter((v) => v.length > 0);

  const requestChangeEvent$ = xs.combine(project$, credential$).map<Events>(([projectKey, credential]) => {
    return {
      kind: "GetWholeDataRequest",
      env: env,
      credential,
      projectKey: projectKey,
    };
  });

  const suggestionEvent$ = xs
    .combine(project$, credential$, lastTerm$)
    .map<Events>(([projectKey, credential, term]) => {
      return {
        kind: "GetSuggestionRequest",
        env: env,
        credential,
        projectKey: projectKey,
        term,
      };
    });

  return isolate(JiraLoader, { HTTP: "jiraLoader" })({
    HTTP: sources.HTTP,
    events: xs.merge(sync$, requestChangeEvent$, suggestionEvent$),
  });
};

const main = (sources: MainSources): MainSinks => {
  const userConfigurationSink = isolate(UserConfiguration, { DOM: "userConfiguration" })({
    ...sources,
    props: sources.state.stream.map<UserConfigurationProps>(({ setting: environment }) => ({
      setting: environment,
      setupFinished: environment.isSetupFinished(),
    })),
    testid: "user-configuration",
  });
  const projectInformationSink = isolate(ProjectInformation, { DOM: "projectInformation" })({
    ...sources,
    props: sources.state
      .select<MainState["data"]>("data")
      .select<MainState["data"]["project"]>("project")
      .stream.startWith(undefined)
      .map<ProjectInformationProps>((data) => ({ project: data })),
    testid: "project-information",
  });
  const syncJiraSink = (isolate(SyncJira, { DOM: "syncJira" }) as Component<SyncJiraSources, SyncJiraSinks>)({
    ...sources,
    testid: "sync-jira",
    props: xs
      .combine(
        sources.state.select<MainState["setting"]>("setting").stream.map((v) => v.isSetupFinished()),
        sources.state
          .select<MainState["projectKey"]>("projectKey")
          .stream.map((v) => !!v)
          .startWith(false),
        sources.state.select<MainState["loading"]>("loading").stream
      )
      .map<SyncJiraProps>(([setupFinished, project, status]) => ({ setupFinished: setupFinished && project, status })),
  });

  const jiraLoaderSink = jiraLoader(sources, syncJiraSink);
  const zoomSliderSink = isolate(ZoomSlider, { DOM: "zoomSlider" })({
    ...sources,
    props: sources.panZoom.state.map((v) => ({ zoom: v.zoomPercentage })),
    testid: "zoom-slider",
  });

  const sideToolbarSink = isolate(
    SideToolbar,
    "sideToolbar"
  )({
    ...sources,
    props: xs.of<GraphLayout>(GraphLayout.Horizontal).remember(),
    testid: "side-toolbar",
  });

  const projectToolbarSink = isolate(
    ProjectToolbar,
    "projectToolbar"
  )({
    ...sources,
    props: sources.state
      .select<MainState["data"]>("data")
      .stream.map((v) => v.suggestion)
      .filter(filterUndefined)
      .startWith(suggestionFactory({})),
  });

  const userConfiguration$ = userConfigurationSink.DOM;
  const projectInformation$ = projectInformationSink.DOM;
  const zoomSlider$ = zoomSliderSink.DOM;
  const syncJira$ = syncJiraSink.DOM;
  const sideToolbar$ = sideToolbarSink.DOM;
  const projectToolbar$ = projectToolbarSink.DOM;

  const vnode$ = xs
    .combine(userConfiguration$, projectInformation$, zoomSlider$, syncJira$, sideToolbar$, projectToolbar$)
    .map(([userConfiguration, projectInformation, zoomSlider, syncJira, sideToolbar, projectToolbar]) => (
      <div>
        <div class={Styles.topToolbar}>
          {projectInformation}
          {syncJira}
          {projectToolbar}
          <div></div>
          {userConfiguration}
        </div>
        {zoomSlider}
        {sideToolbar}
      </div>
    ));

  const issueGraph$ = xs
    .combine(
      sources.state.stream.map(({ data }) => data.issues),
      sources.state.stream.map(({ data }) => data.project).filter(filterUndefined),
      sources.state.stream.map(({ sideToolbar }) => sideToolbar?.graphLayout).filter(filterUndefined),
      sources.panZoom.state
    )
    .map(([issues, project, graphLayout, panZoomState]) => {
      return {
        panZoom: panZoomState,
        issues,
        project,
        graphLayout,
      };
    });

  const storageReducer$ = sources.STORAGE.select<Storage>("settings").map((v) => {
    return function (prevState?: MainState) {
      if (!prevState) return undefined;

      return produce(prevState, (draft) => {
        draft.setting = settingFactory(v);
        if (v.graphLayout) {
          draft.sideToolbar = { graphLayout: v.graphLayout };
        }
      });
    };
  });

  const initialReducer$ = xs.of<Reducer<MainState>>(() => {
    return {
      data: { issues: [] },
      setting: settingFactory({}),
      jiraSync: LoaderStatus.COMPLETED,
      projectKey: undefined,
      sideToolbar: {
        graphLayout: GraphLayout.Horizontal,
      },
      loading: "COMPLETED",
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
        draft.data.suggestion = data?.suggestion ?? draft.data.suggestion;
      });
    };
  });

  const storage$ = xs
    .combine(
      sources.state.select<MainState["setting"]>("setting").stream,
      sources.state.select<MainState["sideToolbar"]>("sideToolbar").stream.filter(filterUndefined)
    )
    .fold<Storage | null>((accum, [v, toolBar]) => {
      if (!accum) {
        return { ...v.toArgument(), graphLayout: toolBar.graphLayout };
      }

      const newArg = { ...v.toArgument(), GraphLayout: toolBar.graphLayout };
      return equal(newArg, accum) ? accum : newArg;
    }, null)
    .filter(filterNull)
    .map<StorageSink>((v) => v);

  const HTTP = xs.merge(jiraLoaderSink.HTTP);

  const loadingReducer$ = xs
    .merge(HTTP.mapTo(true), flatten(sources.HTTP.select() as unknown as Stream<Stream<unknown>>).mapTo(false))
    .fold((accum, ret) => {
      return Math.max(ret ? accum + 1 : accum - 1, 0);
    }, 0)
    .map((v) => (v === 0 ? "COMPLETED" : "LOADING"))
    .map((loading: LoaderState) => {
      return function (prevState?: MainState) {
        if (!prevState) {
          return undefined;
        }

        return produce(prevState, (draft) => {
          draft.loading = loading;
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
      projectReducer$,
      sideToolbarSink.state as Stream<Reducer<MainState>>,
      projectToolbarSink.state as Stream<Reducer<MainState>>,
      userConfigurationSink.state as Stream<Reducer<MainState>>,
      loadingReducer$
    ),
    issueGraph: issueGraph$,
    HTTP: HTTP,
    STORAGE: storage$,
  };
};

if (process.env.CI === "ci") {
  const { worker } = await import("./mock-worker");

  worker.start();
}

run(withState(main), {
  DOM: makeDOMDriver("#root"),
  issueGraph: makeIssueGraphDriver("#root"),
  panZoom: makePanZoomDriver("#root"),
  HTTP: makeHTTPDriver(),
  STORAGE: makeStorageDriver("jiraDependencyTree", localStorage),
});
