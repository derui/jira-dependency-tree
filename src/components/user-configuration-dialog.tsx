import { jsx, VNode } from "snabbdom"; // eslint-disable-line unused-imports/no-unused-imports
import xs, { Stream } from "xstream";
import { selectAsMain } from "@/components/helper";
import { ComponentSinks, ComponentSources } from "@/components/type";

export type UserConfigurationState = {
  jiraToken: string;
  email: string;
  userDomain: string;
};

type UserConfigurationDialogSources = ComponentSources<{}>;

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

  return {
    submit$,
    changeCredential$,
    changeUserDomain$,
    changeEmail$,
  };
};

const model = function model(actions: ReturnType<typeof intent>) {
  return xs
    .combine(
      actions.changeCredential$.startWith(""),
      actions.changeUserDomain$.startWith(""),
      actions.changeEmail$.startWith("")
    )
    .map(([credential, userDomain, email]) => ({
      jiraToken: credential,
      email,
      userDomain,
      allowSubmit: !!credential && !!userDomain && !!email,
    }))
    .remember();
};

const view = function view(state$: ReturnType<typeof model>) {
  return state$.map(({ allowSubmit }) => (
    <form class={{ "user-configuration__form": true }} attrs={{ method: "dialog" }}>
      <label class={{ "user-configuration__input-container": true }}>
        <span class={{ "user-configuration__input-label": true }}>User Domain</span>
        <input class={{ "user-configuration__user-domain": true }} attrs={{ type: "text", placeholder: "required" }} />
      </label>
      <label class={{ "user-configuration__input-container": true }}>
        <span class={{ "user-configuration__input-label": true }}>Email</span>
        <input class={{ "user-configuration__email": true }} attrs={{ type: "text", placeholder: "required" }} />
      </label>
      <label class={{ "user-configuration__input-container": true }}>
        <span class={{ "user-configuration__input-label": true }}>Credential</span>
        <input class={{ "user-configuration__credential": true }} attrs={{ type: "text", placeholder: "required" }} />
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
      .map(({ jiraToken, email, userDomain }) => actions.submit$.map(() => ({ jiraToken, email, userDomain })))
      .flatten(),
  };
};