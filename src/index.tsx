import React from "react"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { createRoot } from "react-dom/client";
import { BehaviorSubject } from "rxjs";
import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { v4 } from "uuid";
import { IssueGraphSink, makeIssueGraphDriver } from "./drivers/issue-graph";
import { Setting, SettingArgument } from "./model/setting";
import { makeStorageDriver, StorageSink } from "./drivers/storage";
import { env } from "./env";
import { createStore } from "./state/store";
import { createDependencyRegistrar } from "./util/dependency-registrar";
import { Dependencies } from "./dependencies";
import { postJSON } from "./infrastructures/fetch";
import { changeZoom, deselectIssueInGraph, restoreApiCredential, selectIssueInGraph } from "./state/actions";
import { queryProject } from "./state/selectors/project";
import { getGraphLayout } from "./state/selectors/graph-layout";
import { queryIssues } from "./state/selectors/issues";
import { getApiCrednetial } from "./state/selectors/api-credential";
import { App } from "./app";

// wiring depencencies

const registrar = createDependencyRegistrar<Dependencies>();
registrar.register("env", env);
registrar.register("postJSON", postJSON);
registrar.register("generateId", () => v4());

const store = createStore(registrar);

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

const selectStorageValue = createDraftSafeSelector(getGraphLayout(), getApiCrednetial(), (graphLayout, credential) => {
  if (!credential) {
    return undefined;
  }

  return {
    graphLayout,
    credentials: {
      email: credential.email,
      jiraToken: credential.token,
    },
    userDomain: credential.userDomain,
    issueNodeSize: { width: 160, height: 80 },
  } as SettingArgument;
});
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
  }
});

// get data from
store.subscribe(() => {
  const sink = selectIssueGraphSink(store.getState());

  if (sink.project && sink.issues) {
    issueGraphSubject.next({
      graphLayout: sink.graphLayout,
      issues: sink.issues,
      project: sink.project,
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

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(document.getElementById("root")!);

root.render(
  <Provider store={store}>
    <App />
  </Provider>,
);
