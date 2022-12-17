import { jsx, VNode } from "snabbdom"; // eslint-disable-line
import xs, { Stream } from "xstream";
import { classes, generateTestId, selectAsMain } from "@/components/helper";
import { ComponentSinkBase, ComponentSourceBase } from "@/components/type";
import isolate from "@cycle/isolate";
import { Input, InputProps, InputSinks } from "./atoms/input";

export type UserConfigurationState = {
  jiraToken: string;
  email: string;
  userDomain: string;
};

type ConfigurationCancelEvent = { kind: "cancel" };
type ConfigurationSubmitEvent = { kind: "submit"; state: UserConfigurationState };

type Event = ConfigurationSubmitEvent | ConfigurationCancelEvent;

interface UserConfigurationDialogSources extends ComponentSourceBase {
  props: Stream<Partial<UserConfigurationState>>;
}

interface UserConfigurationDialogSinks extends ComponentSinkBase {
  value: Stream<Event>;
}

const intent = function intent(sources: UserConfigurationDialogSources) {
  const submit$ = selectAsMain(sources, ".user-configuration__form")
    .events("submit", { preventDefault: true, bubbles: false })
    .mapTo(true);

  const cancel$ = selectAsMain(sources, ".user-configuration__cancel")
    .events("click", { preventDefault: true, bubbles: false })
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
    cancel$,
    props$,
  };
};

const model = function model(
  actions: ReturnType<typeof intent>,
  nodes: {
    jiraToken: InputSinks;
    email: InputSinks;
    userDomain: InputSinks;
  }
) {
  return actions.props$
    .map((v) => {
      return xs
        .combine(
          nodes.email.value,
          nodes.jiraToken.value,
          nodes.userDomain.value,
          nodes.email.DOM,
          nodes.jiraToken.DOM,
          nodes.userDomain.DOM
        )
        .map(([email, credential, userDomain, emailDOM, jiraTokenDOM, userDomainDOM]) => ({
          jiraToken: credential,
          email,
          userDomain,
          allowSubmit: !!credential && !!userDomain && !!email,
          nodes: {
            email: emailDOM,
            jiraToken: jiraTokenDOM,
            userDomain: userDomainDOM,
          },
        }));
    })
    .flatten()
    .remember();
};

const Styles = {
  form: classes("flex", "flex-col", "pb-0", "h-full"),
  main: classes("pb-4"),

  marker: (show: boolean) => {
    return {
      ...classes("absolute", "top-0", "left-0", "inline-block", "invisible", "bg-primary-400", "w-3", "h-4", "rounded"),
      ...(show ? classes("visible") : {}),
    };
  },
};

const view = function view(state$: ReturnType<typeof model>, gen: ReturnType<typeof generateTestId>) {
  return state$.map(({ allowSubmit, nodes }) => (
    <form class={Styles.form} attrs={{ method: "dialog" }}>
      <div class={Styles.main}>
        {nodes.userDomain}
        {nodes.email}
        {nodes.jiraToken}
      </div>
      <div class={{ "user-configuration__footer": true }}>
        <input
          class={{ "user-configuration__cancel": true }}
          attrs={{ type: "button", value: "Cancel" }}
          dataset={{ testid: gen("cancel") }}
        />

        <input
          class={{ "user-configuration__submit": true }}
          attrs={{ type: "submit", disabled: !allowSubmit, value: "Apply" }}
          dataset={{ testid: gen("submit") }}
        />
      </div>
    </form>
  ));
};

export const UserConfigurationDialog = function UserConfigurationDialog(
  sources: UserConfigurationDialogSources
): UserConfigurationDialogSinks {
  const userDomain = isolate(
    Input,
    "userDomain"
  )({
    ...sources,
    props: sources.props.map<InputProps>(({ userDomain }) => {
      return {
        placeholder: "e.g. your-domain",
        value: userDomain ?? "",
        label: "User Domain",
      };
    }),
  });
  const email = isolate(
    Input,
    "email"
  )({
    ...sources,
    props: sources.props.map<InputProps>(({ email }) => {
      return {
        placeholder: "e.g. your@example.com",
        value: email ?? "",
        label: "Email",
      };
    }),
  });
  const jiraToken = isolate(
    Input,
    "jiraToken"
  )({
    ...sources,
    props: sources.props.map<InputProps>(({ jiraToken }) => {
      return {
        placeholder: "required",
        value: jiraToken ?? "",
        label: "Credential",
      };
    }),
  });

  const actions = intent(sources);
  const state$ = model(actions, { userDomain, email, jiraToken });

  const submit$ = state$
    .map(({ jiraToken, email, userDomain }) =>
      actions.submit$.take(1).map<Event>(() => ({ kind: "submit", state: { jiraToken, email, userDomain } }))
    )
    .flatten();

  const cancel$ = actions.cancel$.mapTo<Event>({ kind: "cancel" });

  return {
    DOM: view(state$, generateTestId(sources.testid)),
    value: xs.merge(submit$, cancel$),
  };
};
