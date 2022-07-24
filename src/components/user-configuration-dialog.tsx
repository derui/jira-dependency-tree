import { jsx, VNode } from "snabbdom"; // eslint-disable-line unused-imports/no-unused-imports
import xs, { Stream } from "xstream";
import { selectAsMain } from "@/components/helper";
import { ComponentSinks, ComponentSources } from "@/components/type";

export type UserConfigurationState = {
  jiraToken: string;
  userDomain: string;
};

type UserConfigurationSources = ComponentSources<{}>;

type UserConfigurationSinks = ComponentSinks<{
  value: Stream<UserConfigurationState>;
}>;

const intent = function intent(sources: UserConfigurationSources) {
  const submit$ = selectAsMain(sources, ".user-configuration__form")
    .events("submit", { preventDefault: true, bubbles: false })
    .mapTo(true);
  const changeCredential$ = selectAsMain(sources, ".user-configuration__credential")
    .events("input")
    .map((ev) => {
      return (ev.target as HTMLInputElement).value.trim();
    });
  const changeUserDomain$ = selectAsMain(sources, ".user-configuration__user-domain")
    .events("input")
    .map((ev) => {
      return (ev.target as HTMLInputElement).value.trim();
    });

  return {
    submit$,
    changeCredential$,
    changeUserDomain$,
  };
};

const model = function model(actions: ReturnType<typeof intent>) {
  return xs
    .combine(actions.changeCredential$.startWith(""), actions.changeUserDomain$.startWith(""))
    .map(([credential, userDomain]) => ({
      jiraToken: credential,
      userDomain,
      allowSubmit: !!credential && !!userDomain,
    }))
    .remember();
};

const view = function view(state$: ReturnType<typeof model>) {
  return state$.map(({ allowSubmit }) => (
    <form class={{ "user-configuration__form": true }} attrs={{ method: "dialog" }}>
      <input class={{ "user-configuration__credential": true }} attrs={{ type: "text" }} />
      <input class={{ "user-configuration__user-domain": true }} attrs={{ type: "text" }} />
      <input
        class={{ "user-configuration__submitter": true }}
        attrs={{ type: "submit", disabled: !allowSubmit, value: "Apply" }}
      />
    </form>
  ));
};

export const UserConfiguration = function UserConfiguration(sources: UserConfigurationSources): UserConfigurationSinks {
  const actions = intent(sources);
  const state$ = model(actions);

  return {
    DOM: view(state$),
    value: state$.map(({ jiraToken, userDomain }) => actions.submit$.map(() => ({ jiraToken, userDomain }))).flatten(),
  };
};
