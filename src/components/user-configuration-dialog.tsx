import { jsx, VNode } from "snabbdom"; // eslint-disable-line
import xs, { Stream } from "xstream";
import { selectAsMain } from "@/components/helper";
import { ComponentSinks, ComponentSources } from "@/components/type";

export type UserConfigurationState = {
  jiraToken: string;
  email: string;
  userDomain: string;
};

type UserConfigurationDialogSources = ComponentSources<{
  props: Stream<Partial<UserConfigurationState>>;
}>;

type UserConfigurationDialogSinks = ComponentSinks<{
  value: Stream<UserConfigurationState>;
}>;

const intent = function intent(sources: UserConfigurationDialogSources) {
  const submit$ = selectAsMain(sources, ".user-configuration__form")
    .events("submit", { preventDefault: true, bubbles: false })
    .mapTo(true);
  const changeCredential$ = selectAsMain(sources, ".user-configuration__credential")
    .events("input")
    .map((ev) => {
      return (ev.target as HTMLInputElement).value.trim();
    });
  const changeEmail$ = selectAsMain(sources, ".user-configuration__email")
    .events("input")
    .map((ev) => {
      return (ev.target as HTMLInputElement).value.trim();
    });
  const changeUserDomain$ = selectAsMain(sources, ".user-configuration__user-domain")
    .events("input")
    .map((ev) => {
      return (ev.target as HTMLInputElement).value.trim();
    });
  const props$ = sources.props;

  return {
    submit$,
    changeCredential$,
    changeUserDomain$,
    changeEmail$,
    props$,
  };
};

const model = function model(actions: ReturnType<typeof intent>) {
  return actions.props$
    .map((v) => {
      return xs
        .combine(
          actions.changeCredential$.startWith(v.jiraToken || ""),
          actions.changeUserDomain$.startWith(v.userDomain || ""),
          actions.changeEmail$.startWith(v.email || "")
        )
        .map(([credential, userDomain, email]) => ({
          jiraToken: credential,
          email,
          userDomain,
          allowSubmit: !!credential && !!userDomain && !!email,
        }));
    })
    .flatten()
    .remember();
};

const view = function view(state$: ReturnType<typeof model>) {
  return state$.map(({ jiraToken, email, userDomain, allowSubmit }) => (
    <form class={{ "user-configuration__form": true }} attrs={{ method: "dialog" }}>
      <label class={{ "user-configuration__input-container": true }}>
        <span class={{ "user-configuration__input-label": true }}>User Domain</span>
        <input
          class={{ "user-configuration__user-domain": true }}
          attrs={{ type: "text", placeholder: "required", value: userDomain }}
        />
      </label>
      <label class={{ "user-configuration__input-container": true }}>
        <span class={{ "user-configuration__input-label": true }}>Email</span>
        <input
          class={{ "user-configuration__email": true }}
          attrs={{ type: "text", placeholder: "required", value: email }}
        />
      </label>
      <label class={{ "user-configuration__input-container": true }}>
        <span class={{ "user-configuration__input-label": true }}>Credential</span>
        <input
          class={{ "user-configuration__credential": true }}
          attrs={{ type: "text", placeholder: "required", value: jiraToken }}
        />
      </label>
      <input
        class={{ "user-configuration__submitter": true }}
        attrs={{ type: "submit", disabled: !allowSubmit, value: "Apply" }}
      />
    </form>
  ));
};

export const UserConfigurationDialog = function UserConfigurationDialog(
  sources: UserConfigurationDialogSources
): UserConfigurationDialogSinks {
  const actions = intent(sources);
  const state$ = model(actions);

  return {
    DOM: view(state$),
    value: state$
      .map(({ jiraToken, email, userDomain }) => actions.submit$.take(1).map(() => ({ jiraToken, email, userDomain })))
      .flatten(),
  };
};
