import { jsx, VNode } from "snabbdom"; // eslint-disable-line
import xs, { Stream } from "xstream";
import { classes, generateTestId, selectAsMain } from "@/components/helper";
import { ComponentSinkBase, ComponentSourceBase } from "@/components/type";
import isolate from "@cycle/isolate";
import { Input, InputProps, InputSinks } from "./atoms/input";
import { isolateSink } from "@cycle/state";
import { Button, ButtonProps } from "./atoms/button";
import { AsNodeStream, mergeNodes, NodesStream } from "test/helper";

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
        .combine(nodes.email.value, nodes.jiraToken.value, nodes.userDomain.value)
        .map(([email, credential, userDomain]) => ({
          jiraToken: credential ?? v.jiraToken,
          email: email ?? v.email,
          userDomain: userDomain ?? v.userDomain,
          allowSubmit: !!credential && !!userDomain && !!email,
        }));
    })
    .flatten()
    .remember();
};

const Styles = {
  form: classes("flex", "flex-col", "pb-0", "h-full"),
  main: classes("pb-4"),

  footer: classes("flex", "flex-auto", "flex-row", "justify-space-between", "p-3", "border-t-1", "border-t-lightgray"),
};

const view = function view(
  state$: ReturnType<typeof model>,
  nodes$: AsNodeStream<["jiraToken", "email", "userDomain", "submit", "cancel"]>,
  gen: ReturnType<typeof generateTestId>
) {
  return xs.combine(state$, nodes$).map(([, nodes]) => (
    <form class={Styles.form} attrs={{ method: "dialog" }} dataset={{ testid: gen("dialog") }}>
      <div class={Styles.main}>
        {nodes.userDomain}
        {nodes.email}
        {nodes.jiraToken}
      </div>
      <div class={Styles.footer}>
        {nodes.cancel}
        {nodes.submit}
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

  const submit = isolate(
    Button,
    "submit"
  )({
    ...sources,
    props: state$.map<ButtonProps>(({ allowSubmit }) => ({
      label: "Apply",
      schema: "primary",
      type: "submit",
      disabled: !allowSubmit,
    })),
  });
  const cancel = isolate(
    Button,
    "cancel"
  )({
    ...sources,
    props: xs.of<ButtonProps>({ label: "Cancel", schema: "primary" }),
  });

  const submit$ = state$
    .map(({ jiraToken, email, userDomain }) =>
      submit.click.take(1).map<Event>(() => ({ kind: "submit", state: { jiraToken, email, userDomain } }))
    )
    .flatten();

  const cancel$ = cancel.click.mapTo<Event>({ kind: "cancel" });

  return {
    DOM: view(
      state$,
      mergeNodes({
        jiraToken: jiraToken.DOM,
        email: email.DOM,
        userDomain: userDomain.DOM,
        submit: submit.DOM,
        cancel: cancel.DOM,
      }),
      generateTestId(sources.testid)
    ),
    value: xs.merge(submit$, cancel$),
  };
};
