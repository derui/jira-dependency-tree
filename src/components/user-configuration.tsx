import { Environment, environmentFactory } from "@/environment";
import { filterNull } from "@/util/basic";
import { Reducer, StateSource } from "@cycle/state";
import produce from "immer";
import { jsx, VNode } from "snabbdom"; // eslint-disable-line unused-imports/no-unused-imports
import xs, { Stream } from "xstream";
import { selectAsMain } from "@/components/helper";
import { ComponentSinks, ComponentSources } from "@/components/type";

type UserConfigurationState = {
  environment: Environment;
};

type UserConfigurationSources = ComponentSources<{
  state: StateSource<UserConfigurationState>;
}>;

type UserConfigurationSinks = ComponentSinks<{
  state: Stream<Reducer<UserConfigurationState>>;
}>;

export const UserConfiguration = function UserConfiguration(sources: UserConfigurationSources): UserConfigurationSinks {
  const state$ = sources.state.stream;

  const submit$ = selectAsMain(sources, ".user-configuration__form").events("submit", { preventDefault: true });
  const credential$ = selectAsMain(sources, ".user-configuration__credential").element();
  const userDomain$ = selectAsMain(sources, ".user-configuration__user-domain").element();
  const values$ = xs.combine(
    credential$.map((v) => v.nodeValue).filter(filterNull),
    userDomain$.map((v) => v.nodeValue).filter(filterNull)
  );

  const initialReducer = function initialReducer(): UserConfigurationState {
    return {
      environment: environmentFactory({}),
    };
  };

  const applyReducer$ = submit$
    .map(() =>
      values$.map(([credential, userDomain]) => {
        return (prevState?: UserConfigurationState) => {
          if (!prevState) {
            return undefined;
          }

          return produce(prevState, (draft) => {
            draft.environment = draft.environment.applyCredentials(credential).applyUserDomain(userDomain);
          });
        };
      })
    )
    .flatten();

  const reducer$ = xs.merge(xs.of(initialReducer), applyReducer$);

  const vnode$ = xs
    .combine(
      values$.map(([cred, domain]) => !!cred && !!domain),
      state$
    )
    .startWith([false, initialReducer()])
    .map(([enabled, state]) => (
      <form class={{ "user-configuration__form": true }}>
        <input
          attrs={{ type: "input", value: state.environment.credentials.jiraToken || "" }}
          class={{ "user-configuration__credential": true }}
        />
        <input
          class={{ "user-configuration__user-domain": true }}
          attrs={{ type: "input" }}
          props={{ value: state.environment.userDomain }}
        />
        <input class={{ "user-configuration__submitter": true }} attrs={{ type: "submit", disabled: !enabled }}>
          Apply
        </input>
      </form>
    ));

  return {
    DOM: vnode$,
    state: reducer$,
  };
};
