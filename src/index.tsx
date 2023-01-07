import run from "@cycle/run";
import { jsx, VNode } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { DOMSource, makeDOMDriver } from "@cycle/dom";
import { Reducer, StateSource, withState } from "@cycle/state";
import xs, { Stream } from "xstream";
import isolate from "@cycle/isolate";
import produce from "immer";
import { HTTPSource, makeHTTPDriver, RequestInput } from "@cycle/http";
import equal from "fast-deep-equal/es6";
import { IssueGraphSink, IssueGraphSource, makeIssueGraphDriver } from "./drivers/issue-graph";
import { Issue } from "./model/issue";
import { Setting, SettingArgument, settingFactory } from "./model/setting";
import { UserConfiguration } from "./components/user-configuration";
import { ProjectInformation, State as ProjectInformationState } from "./components/project-information";
import { filterNull, filterUndefined } from "./util/basic";
import { ZoomSlider } from "./components/zoom-slider";
import { makeStorageDriver, StorageSink, StorageSource } from "./drivers/storage";
import { SyncIssueButton } from "./components/sync-issue-button";
import { ApiCredential, SearchCondition } from "./model/event";
import { SideToolbar, SideToolbarState } from "./components/side-toolbar";
import { GraphLayout } from "./issue-graph/type";
import { classes, simpleReduce } from "./components/helper";
import { ProjectSyncOptionEditor, State } from "./components/project-sync-option-editor";
import { makePortalDriver, PortalSink, PortalSource } from "./drivers/portal";
import { env } from "./env";
import { IssueSearcher } from "./components/issue-searcher";

type MainSources = {
  DOM: DOMSource;
  state: StateSource<MainState>;
  HTTP: HTTPSource;
  STORAGE: StorageSource;
  Portal: PortalSource;
  issueGraph: IssueGraphSource;
};

type MainSinks = {
  DOM: Stream<VNode>;
  state: Stream<Reducer<MainState>>;
  issueGraph: Stream<IssueGraphSink>;
  HTTP: Stream<RequestInput>;
  STORAGE: Stream<StorageSink>;
  Portal: Stream<PortalSink>;
};

type MainState = {
  data: {
    issues: Issue[];
    searchCondition?: SearchCondition;
  };
  projectKey: string | undefined;
  setting?: Setting;
  apiCredential?: ApiCredential;
} & { sideToolbar?: SideToolbarState } & { projectSyncOptionEditor?: State } & {
  projectInformation?: ProjectInformationState;
};

type Storage = {
  settings: SettingArgument & { graphLayout?: GraphLayout };
};

const Styles = {
  root: classes("w-full", "h-full", "absolute"),
  topToolbars: classes("absolute", "grid", "grid-cols-top-toolbar", "grid-rows-1", "top-3", "px-3", "w-full", "z-10"),
  projectToolbar: classes(
    "relative",
    "bg-white",
    "px-3",
    "shadow-md",
    "gap-2",
    "grid",
    "grid-cols-project-toolbar",
    "transition-height",
  ),
  divider: classes("w-0", "border-l", "border-lightgray", "m-2"),
};

const main = (sources: MainSources): MainSinks => {
  const userConfigurationSink = isolate(
    UserConfiguration,
    "userConfiguration",
  )({
    ...sources,
    props: {
      initialSetting: sources.state.select<MainState["setting"]>("setting").stream.filter(filterUndefined),
    },
    testid: "user-configuration",
  });

  const projectInformationSink = isolate(
    ProjectInformation,
    "projectInformation",
  )({
    ...sources,
    props: {
      credential: sources.state.select<MainState["apiCredential"]>("apiCredential").stream.filter(filterUndefined),
    },
    testid: "project-information",
  });
  const syncIssueButtonSink = isolate(
    SyncIssueButton,
    "syncIssueButton",
  )({
    ...sources,
    testid: "sync-issue-button",
    props: {
      credential: sources.state.select<MainState["apiCredential"]>("apiCredential").stream.filter(filterUndefined),
      condition: sources.state
        .select<MainState["projectSyncOptionEditor"]>("projectSyncOptionEditor")
        .stream.map((v) => v?.currentSearchCondition)
        .filter(filterUndefined),
    },
  });

  const zoomSliderSink = isolate(ZoomSlider, { DOM: "zoomSlider" })({
    ...sources,
    props: sources.issueGraph.state.map((v) => ({ zoom: v.zoomPercentage })),
    testid: "zoom-slider",
  });

  const sideToolbarSink = isolate(
    SideToolbar,
    "sideToolbar",
  )({
    ...sources,
    props: xs.of<GraphLayout>(GraphLayout.Horizontal).remember(),
    testid: "side-toolbar",
  });

  const projectSyncOpitonEditorSink = isolate(
    ProjectSyncOptionEditor,
    "projectSyncOptionEditor",
  )({
    ...sources,
    testid: "sync-option-editor",
    props: {
      apiCredential: sources.state.select<MainState["apiCredential"]>("apiCredential").stream.filter(filterUndefined),
      projectKey: sources.state
        .select<MainState["projectInformation"]>("projectInformation")
        .stream.map((project) => project?.project?.key)
        .filter(filterUndefined),
    },
  });

  const issueSearcherSinks = isolate(
    IssueSearcher,
    "issueSearcher",
  )({
    ...sources,
    testid: "issue-searcher",
    props: {
      issues: sources.state.select<MainState["data"]>("data").select<MainState["data"]["issues"]>("issues").stream,
    },
  });

  const userConfiguration$ = userConfigurationSink.DOM;
  const projectInformation$ = projectInformationSink.DOM;
  const zoomSlider$ = zoomSliderSink.DOM;
  const syncIssueButton$ = syncIssueButtonSink.DOM;
  const sideToolbar$ = sideToolbarSink.DOM;
  const projectSyncOptionEditor$ = projectSyncOpitonEditorSink.DOM;

  const vnode$ = xs
    .combine(
      userConfiguration$,
      projectInformation$,
      zoomSlider$,
      syncIssueButton$,
      sideToolbar$,
      projectSyncOptionEditor$,
      issueSearcherSinks.DOM,
    )
    .map(
      ([
        userConfiguration,
        projectInformation,
        zoomSlider,
        syncIssueButton,
        sideToolbar,
        projectSyncOptionEditor,
        issueSearcher,
      ]) => (
        <div class={Styles.root}>
          <div class={Styles.topToolbars}>
            <div class={Styles.projectToolbar}>
              {projectInformation}
              <span class={Styles.divider}></span>
              {projectSyncOptionEditor}
              {syncIssueButton}
            </div>
            <div></div>
            {issueSearcher}
            {userConfiguration}
          </div>
          {zoomSlider}
          {sideToolbar}
        </div>
      ),
    );

  const issueGraph$ = xs
    .combine(
      sources.state.select<MainState["data"]>("data").stream.map((data) => data.issues),
      sources.state
        .select<MainState["projectInformation"]>("projectInformation")
        .stream.map((projectInformation) => projectInformation?.project)
        .filter(filterUndefined),
      sources.state
        .select<MainState["sideToolbar"]>("sideToolbar")
        .stream.map((sideToolbar) => sideToolbar?.graphLayout)
        .filter(filterUndefined),
    )
    .map(([issues, project, graphLayout]) => {
      return {
        issues,
        project,
        graphLayout,
      };
    });

  const storageReducer$ = sources.STORAGE.select<Storage["settings"]>("settings").map((v) => {
    return function (prevState?: MainState) {
      if (!prevState) return undefined;

      return produce(prevState, (draft) => {
        draft.setting = settingFactory(v);
        if (v.graphLayout) {
          draft.sideToolbar = { graphLayout: v.graphLayout, opened: false };
        }
      });
    };
  });

  const initialReducer$ = xs.of<Reducer<MainState>>(() => {
    return {
      data: { issues: [] },
      setting: settingFactory({}),
      projectKey: undefined,
    };
  });

  const credentialReducer$ = userConfigurationSink.value.map(
    (v) =>
      function (prevState?: MainState) {
        if (!prevState) return undefined;

        return produce(prevState, (draft) => {
          draft.setting = v;
          const apiCredential = v.asApiCredential(env);

          if (apiCredential) {
            draft.apiCredential = apiCredential;
          }
        });
      },
  );

  const issueReducer$ = syncIssueButtonSink.value.map(
    simpleReduce<MainState, Issue[]>((draft, issues) => {
      draft.data.issues = issues;
    }),
  );

  const storage$ = xs
    .combine(
      sources.state.select<MainState["setting"]>("setting").stream.filter(filterUndefined),
      sources.state.select<MainState["sideToolbar"]>("sideToolbar").stream.filter(filterUndefined),
    )
    .fold<Storage | null>((accum, [v, toolBar]) => {
      if (!accum) {
        return { settings: { ...v.toArgument(), graphLayout: toolBar.graphLayout } };
      }

      const newArg = { settings: { ...v.toArgument(), graphLayout: toolBar.graphLayout } };
      return equal(newArg, accum) ? accum : newArg;
    }, null)
    .filter(filterNull)
    .map<StorageSink>((v) => v);

  return {
    DOM: vnode$,
    state: xs.merge(
      initialReducer$,
      storageReducer$,
      credentialReducer$,
      issueReducer$,
      sideToolbarSink.state as Stream<Reducer<MainState>>,
      projectSyncOpitonEditorSink.state as Stream<Reducer<MainState>>,
      userConfigurationSink.state as Stream<Reducer<MainState>>,
      projectInformationSink.state as Stream<Reducer<MainState>>,
      syncIssueButtonSink.state as Stream<Reducer<MainState>>,
      issueSearcherSinks.state as Stream<Reducer<MainState>>,
    ),
    issueGraph: issueGraph$,
    HTTP: xs.merge(syncIssueButtonSink.HTTP, projectInformationSink.HTTP, projectSyncOpitonEditorSink.HTTP),
    STORAGE: storage$,
    Portal: xs
      .combine(userConfigurationSink.Portal, projectSyncOpitonEditorSink.Portal)
      .map(([userConfiguration, projectSyncOptionEditor]) => {
        return {
          ...userConfiguration,
          ...projectSyncOptionEditor,
        };
      }),
  };
};

if (process.env.CI === "ci") {
  const { worker } = await import("./mock-worker");

  worker.start();
}

run(withState(main), {
  DOM: makeDOMDriver("#root"),
  issueGraph: makeIssueGraphDriver("#root"),
  HTTP: makeHTTPDriver(),
  STORAGE: makeStorageDriver("jiraDependencyTree", localStorage),
  Portal: makePortalDriver("#portal-root"),
});
