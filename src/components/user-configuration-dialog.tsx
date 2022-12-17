import { jsx } from "snabbdom"; // eslint-disable-line
import xs, { Stream } from "xstream";
import { classes, generateTestId, selectAsMain } from "@/components/helper";
import { ComponentSinkBase, ComponentSourceBase } from "@/components/type";
import isolate from "@cycle/isolate";
import { Input, InputProps } from "./atoms/input";
import { Button, ButtonProps } from "./atoms/button";
import { AsNodeStream, mergeNodes } from "test/helper";
import { Reducer, StateSource } from "@cycle/state";
import produce from "immer";
import { filterEmptyString } from "@/util/basic";

export type UserConfigurationState = {
  jiraToken: string;
  email: string;
  userDomain: string;
  allowSubmit: boolean;
};

type ConfigurationCancelEvent = { kind: "cancel" };
type ConfigurationSubmitEvent = { kind: "submit"; state: Omit<UserConfigurationState, "allowSubmit"> };

type Event = ConfigurationSubmitEvent | ConfigurationCancelEvent;

interface UserConfigurationDialogSources extends ComponentSourceBase {
  props: Stream<Partial<UserConfigurationState>>;
  state: StateSource<UserConfigurationState>;
}

interface UserConfigurationDialogSinks extends ComponentSinkBase {
  value: Stream<Event>;
  state: Stream<Reducer<UserConfigurationState>>;
}

const intent = (sources: UserConfigurationDialogSources) => {
  const submit$ = selectAsMain(sources, '[data-id="form"]')
    .events("submit", { preventDefault: true, bubbles: false })
    .mapTo(true);

  return {
    submit$,
    props$: sources.props,
    state$: sources.state.stream,
  };
};

const model = function model(actions: ReturnType<typeof intent>) {
  return xs
    .combine(actions.props$, actions.state$)
    .map(([v, state]) => {
      return {
        jiraToken: state.jiraToken ?? v.jiraToken,
        email: state.email ?? v.email,
        userDomain: state.userDomain ?? v.userDomain,
        allowSubmit: !!state.jiraToken && !!state.userDomain && !!state.email,
      };
    })
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
    <form class={Styles.form} attrs={{ method: "dialog" }} dataset={{ testid: gen("dialog"), id: "form" }}>
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

  const cancel = isolate(
    Button,
    "cancel"
  )({
    ...sources,
    props: xs.of<ButtonProps>({ label: "Cancel", schema: "primary" }),
  });

  const submit = isolate(
    Button,
    "submit"
  )({
    ...sources,
    props: sources.state
      .select<UserConfigurationState["allowSubmit"]>("allowSubmit")
      .stream.map<ButtonProps>((allowSubmit) => ({
        label: "Apply",
        schema: "primary",
        type: "submit",
        disabled: !allowSubmit,
      })),
  });

  const actions = intent(sources);
  const state$ = model(actions);

  const submit$ = state$
    .map(({ jiraToken, email, userDomain }) =>
      submit.click.take(1).map<Event>(() => ({ kind: "submit", state: { jiraToken, email, userDomain } }))
    )
    .flatten();

  const cancel$ = cancel.click.mapTo<Event>({ kind: "cancel" });

  const initialReducer$ = xs.of<Reducer<UserConfigurationState>>(() => {
    return {
      jiraToken: "",
      userDomain: "",
      email: "",
      allowSubmit: false,
    };
  });

  const propsReducer$ = sources.props.map<Reducer<UserConfigurationState>>((props) => {
    return (prevState) => {
      if (!prevState) return;

      return produce(prevState, (draft) => {
        draft.jiraToken = props.jiraToken ?? "";
        draft.userDomain = props.userDomain ?? "";
        draft.email = props.email ?? "";
        draft.allowSubmit =
          filterEmptyString(props.jiraToken) && filterEmptyString(props.email) && filterEmptyString(props.jiraToken);
      });
    };
  });

  const stateReducer$ = xs
    .combine(email.value, userDomain.value, jiraToken.value)
    .map<Reducer<UserConfigurationState>>(([email, userDomain, jiraToken]) => {
      return (prevState) => {
        if (!prevState) return;

        return produce(prevState, (draft) => {
          draft.jiraToken = jiraToken;
          draft.userDomain = userDomain;
          draft.email = email;
          draft.allowSubmit = filterEmptyString(jiraToken) && filterEmptyString(email) && filterEmptyString(jiraToken);
        });
      };
    });

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
    state: xs.merge(initialReducer$, propsReducer$, stateReducer$),
  };
};
