import { createRoot } from "react-dom/client";
import { BehaviorSubject } from "rxjs";
import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { v4 } from "uuid";
import { install } from "@twind/core";
import { IssueGraphSink, makeIssueGraphDriver } from "./drivers/issue-graph";
import { SettingArgument } from "./model/setting";
import { makeStorageDriver, StorageSink } from "./drivers/storage";
import { env } from "./env";
import { RootState, createStore } from "./state/store";
import { createDependencyRegistrar } from "./util/dependency-registrar";
import { Dependencies } from "./dependencies";
import {
  changeZoom,
  deselectIssueInGraph,
  expandIssue,
  restoreApiCredential,
  selectIssueInGraph,
} from "./state/actions";
import { App } from "./app";
import config from "./twind.config.cjs";
import { RegistrarContext } from "./registrar-context";

// wiring depencencies

const registrar = createDependencyRegistrar<Dependencies>();
registrar.register("env", env);
registrar.register("generateId", () => v4());

const store = createStore();

// wiring storage driver
const storageDriver = makeStorageDriver("jiraDependencyTree", localStorage);

const storageSubject = new BehaviorSubject<StorageSink | undefined>(undefined);

storageDriver(storageSubject)
  .select<SettingArgument>("settings")
  .subscribe((v) => {
    const email = v.credentials?.email;
    const userDomain = v.userDomain;
    const token = v.credentials?.jiraToken;

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

const issueGraphSubject = new BehaviorSubject<IssueGraphSink | null>(null);

const selectIssueGraphSink = createDraftSafeSelector(
  (state: RootState) => state.graphLayout.layout,
  (state: RootState) => state.issues.issues,
  (state: RootState) => state.relations.relations,
  (layout, issues, relations) => {
    return {
      graphLayout: layout,
      issues: Object.values(issues),
      relations: Object.values(relations),
    };
  },
);

const selectStorageValue = createDraftSafeSelector(
  (state: RootState) => state.apiCredential.credential,
  (credential) => {
    if (!credential) {
      return undefined;
    }

    return {
      credentials: {
        email: credential.email,
        jiraToken: credential.token,
      },
      userDomain: credential.userDomain,
      issueNodeSize: { width: 160, height: 80 },
    } as SettingArgument;
  },
);
const issueGraphSource = makeIssueGraphDriver("#graph-root")(issueGraphSubject);

registrar.register("sendCommandTo", (command) => {
  issueGraphSource.runCommand(command);
});

issueGraphSource.state$.subscribe((state) => {
  if (store.getState().zoom.zoomPercentage !== state.zoomPercentage) {
    store.dispatch(changeZoom(state.zoomPercentage));
  }
});

issueGraphSource.action$.subscribe((action) => {
  switch (action.kind) {
    case "SelectIssue":
      store.dispatch(deselectIssueInGraph());
      store.dispatch(selectIssueInGraph(action.key));
      break;
    case "ExpandSelectedIssue":
      store.dispatch(expandIssue(action.key));
      break;
  }
});

// get data from
store.subscribe(() => {
  const sink = selectIssueGraphSink(store.getState());

  if (sink.issues) {
    issueGraphSubject.next({
      graphLayout: sink.graphLayout,
      issues: sink.issues,
      relations: sink.relations,
    });
  }

  const newValue = selectStorageValue(store.getState());
  const storage = storageSubject.getValue()?.settings as SettingArgument | undefined;

  if (newValue && storage !== newValue) {
    storageSubject.next({ settings: newValue });
  }
});

if (process.env.CI === "ci") {
  const { worker } = await import("./mock-worker");

  worker.start();
}

install(config, process.env.NODE_ENV === "production");

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(document.getElementById("root")!);

root.render(
  <RegistrarContext.Provider value={registrar}>
    <Provider store={store}>
      <App />
    </Provider>
  </RegistrarContext.Provider>,
);
