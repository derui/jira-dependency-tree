import { jsx } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import xs, { MemoryStream, Stream } from "xstream";
import { ComponentSinks, ComponentSources } from "@/components/type";
import { selectAsMain } from "@/components/helper";
import { LoaderState, LoaderStatus } from "@/type";

export interface SyncJiraProps {
  status: LoaderState;
  setupFinished: boolean;
}

export type SyncJiraState = LoaderState;

export type SyncJiraEvent = "REQUEST";

export type SyncJiraSources = ComponentSources<{
  props: MemoryStream<SyncJiraProps>;
}>;

export type SyncJiraSinks = ComponentSinks<{
  value: Stream<SyncJiraEvent>;
}>;

const intent = function intent(sources: SyncJiraSources) {
  const clicked$ = selectAsMain(sources, ".sync-jira__main").events("click").mapTo(true);
  return { props$: sources.props, clicked$ };
};

const model = function model(actions: ReturnType<typeof intent>) {
  const status = actions.props$.map((v) => v.status);
  const setupFinished = actions.props$.map((v) => v.setupFinished);
  const allowSync$ = xs
    .combine(status, setupFinished)
    .map(([status, setupFinished]) => status === "COMPLETED" && setupFinished);
  const syncing$ = xs
    .combine(status, setupFinished)
    .map(([status, setupFinished]) => status === LoaderStatus.LOADING && setupFinished);

  return xs.combine(allowSync$, syncing$).map(([allowSync, syncing]) => ({ allowSync, syncing }));
};

const view = function view(state$: ReturnType<typeof model>) {
  return state$.map(({ allowSync, syncing }) => {
    return (
      <div class={{ "sync-jira": true }} dataset={{ testid: "sync-jira" }}>
        <span class={{ "sync-jira__container": true }}>
          <button
            class={{ "sync-jira__main": true, "--syncing": syncing }}
            attrs={{ disabled: !allowSync }}
            dataset={{ testid: "sync-jira-main" }}
          ></button>
        </span>
      </div>
    );
  });
};

export const SyncJira = function SyncJira(sources: SyncJiraSources): SyncJiraSinks {
  const actions = intent(sources);
  const state$ = model(actions);

  const value$ = actions.clicked$.mapTo<SyncJiraEvent>("REQUEST");

  return {
    DOM: view(state$),
    value: value$,
  };
};
