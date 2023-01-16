import React from "react"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { createRoot } from "react-dom/client";
import { BehaviorSubject } from "rxjs";
import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { IssueGraphSink, makeIssueGraphDriver } from "./drivers/issue-graph";
import { Setting } from "./model/setting";
import { makeStorageDriver, StorageSink } from "./drivers/storage";
import { env } from "./env";
import { createStore } from "./state/store";
import { createDependencyRegistrar } from "./util/dependency-registrar";
import { Dependencies } from "./dependencies";
import { postJSON } from "./infrastructures/fetch";
import { changeZoom, restoreApiCredential } from "./state/actions";
import { queryProject } from "./state/selectors/project";
import { getGraphLayout } from "./state/selectors/graph-layout";
import { queryIssues } from "./state/selectors/issues";
import { getApiCrednetial } from "./state/selectors/api-credential";
import { App } from "./app";

// wiring depencencies

const registrar = createDependencyRegistrar<Dependencies>();
registrar.register("env", env);
registrar.register("postJSON", postJSON);

const store = createStore(registrar);

// wiring storage driver
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

const issueGraphSource = makeIssueGraphDriver("#graph-root")(issueGraphSubject);

registrar.register("sendCommandTo", (command) => {
  issueGraphSource.runCommand(command);
});

issueGraphSource.state$.subscribe((state) => {
  if (store.getState().zoom.zoomPercentage !== state.zoomPercentage) {
    store.dispatch(changeZoom(state.zoomPercentage));
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

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(document.getElementById("root")!);

root.render(
  <Provider store={store}>
    <App />
  </Provider>,
);
