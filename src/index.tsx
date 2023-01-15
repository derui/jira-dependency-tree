import React from "react"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as ReactDOM from "react-dom";
import { BehaviorSubject, Subject } from "rxjs";
import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { IssueGraphSink, IssueGraphSource, makeIssueGraphDriver } from "./drivers/issue-graph";
import { Issue } from "./model/issue";
import { Setting, SettingArgument, settingFactory } from "./model/setting";
import { makeStorageDriver, StorageSink, StorageSource } from "./drivers/storage";
import { ApiCredential, SearchCondition } from "./model/event";
import { GraphLayout } from "./issue-graph/type";
import { env } from "./env";
import { createStore } from "./state/store";
import { createDependencyRegistrar } from "./util/dependency-registrar";
import { Dependencies } from "./dependencies";
import { postJSON } from "./infrastructures/fetch";
import { restoreApiCredential } from "./state/actions";
import { queryProject } from "./state/selectors/project";
import { getGraphLayout } from "./state/selectors/graph-layout";
import { queryIssues } from "./state/selectors/issues";
import { getApiCrednetial } from "./state/selectors/api-credential";
import { App } from "./app";

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

// wiring depencencies

const registrar = createDependencyRegistrar<Dependencies>();
registrar.register("env", env);
registrar.register("postJSON", postJSON);

const store = createStore(registrar);

const storageDriver = makeStorageDriver("jiraDependencyTree", localStorage);

const storageSubject = new BehaviorSubject<StorageSink | undefined>(undefined);

storageDriver(storageSubject)
  .select<Setting>("settings")
  .subscribe((v) => {
    const email = v.credentials.email;
    const userDomain = v.userDomain;
    const token = v.credentials.jiraToken;

    if (email && userDomain && token) {
      store.dispatch(
        restoreApiCredential({
          apiBaseUrl: env.apiBaseUrl,
          apiKey: env.apiKey,
          email: email,
          token: token,
          userDomain: userDomain,
        }),
      );
    }
  });

const issueGraphSubject = new Subject<IssueGraphSink>();

const selectIssueGraphSink = createDraftSafeSelector(
  queryProject(),
  getGraphLayout(),
  queryIssues(),
  ([, project], layout, [, issues]) => {
    return {
      project,
      graphLayout: layout,
      issues,
    };
  },
);

store.subscribe(() => {
  const sink = selectIssueGraphSink(store.getState());

  if (sink.project && sink.issues) {
    issueGraphSubject.next({
      graphLayout: sink.graphLayout,
      issues: sink.issues,
      project: sink.project,
    });
  }

  const credential = getApiCrednetial()(store.getState());

  if (storageSubject.getValue()?.credential !== credential) {
    storageSubject.next({
      apiCredential: credential,
    });
  }
});

if (process.env.CI === "ci") {
  const { worker } = await import("./mock-worker");

  worker.start();
}

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.querySelector("#root"),
);
