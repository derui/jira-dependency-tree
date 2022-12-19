import { jsx } from "snabbdom"; // eslint-disable-line
import xs, { Stream } from "xstream";
import isolate from "@cycle/isolate";
import { Reducer, StateSource } from "@cycle/state";
import produce from "immer";
import { Input, InputProps } from "./atoms/input";
import { Button, ButtonProps } from "./atoms/button";
import { AsNodeStream, mergeNodes } from "./helper";
import { ComponentSinkBase, ComponentSourceBase } from "@/components/type";
import { classes, generateTestId, selectAsMain } from "@/components/helper";
import { filterEmptyString } from "@/util/basic";

export type UserConfigurationValue = {
  jiraToken: string;
  email: string;
  userDomain: string;
};

type UserConfigurationState = UserConfigurationValue & {
  allowSubmit: boolean;
};

interface UserConfigurationDialogSources extends ComponentSourceBase {
  props: Stream<Partial<UserConfigurationValue> & { opened: boolean }>;
  state: StateSource<UserConfigurationState>;
}

interface UserConfigurationDialogSinks extends ComponentSinkBase {
  /**
   * streaming values when value submitted
   */
  value: Stream<UserConfigurationValue>;
  /**
   * streaming values when canceled
   */
  cancel: Stream<boolean>;
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
  return actions.props$
    .map((props) => {
      return actions.state$.map((state) => {
        return {
          jiraToken: state.jiraToken ?? props.email ?? "",
          email: state.email ?? props.email ?? "",
          userDomain: state.userDomain ?? props.userDomain ?? "",
          allowSubmit: state.allowSubmit,
          opened: props.opened,
        };
      });
    })
    .flatten()
    .remember();
};

const Styles = {
  form: classes("flex", "flex-col", "pb-0", "pt-4"),
  main: classes("pb-4", "flex", "flex-col"),
  footer: classes("flex", "flex-auto", "flex-row", "justify-between", "p-3", "border-t-1", "border-t-lightgray"),
  dialogContainer: (opened: boolean) => {
    return {
      ...classes(
        "bg-white",
        "absolute",
        "top-full",
        "right-0",
        "mt-2",
        "rounded",
        "shadow-lg",
        "transition-width",
        "overflow-hidden"
      ),
      ...(!opened ? classes("w-0") : {}),
      ...(opened ? classes("w-96") : {}),
    };
  },
};

const view = function view(
  state$: ReturnType<typeof model>,
  nodes$: AsNodeStream<["jiraToken", "email", "userDomain", "submit", "cancel"]>,
  gen: ReturnType<typeof generateTestId>
) {
  return xs.combine(state$, nodes$).map(([{ opened }, nodes]) => (
    <div class={Styles.dialogContainer(opened)} dataset={{ testid: gen("dialog-container") }}>
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
    </div>
  ));
};

const canSubmit: (args: { jiraToken: string; email: string; userDomain: string }) => boolean = ({
  jiraToken,
  email,
  userDomain,
}) => {
  return filterEmptyString(jiraToken) && filterEmptyString(email) && filterEmptyString(userDomain);
};

export const UserConfigurationDialog = function UserConfigurationDialog(
  sources: UserConfigurationDialogSources
): UserConfigurationDialogSinks {
  const gen = generateTestId(sources.testid);
  const userDomain = isolate(
    Input,
    "userDomain"
  )({
    ...sources,
    testid: gen("user-domain"),
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
    testid: gen("email"),
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
    testid: gen("jira-token"),
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
    testid: gen("cancel"),
    props: xs.of<ButtonProps>({ content: <span>Cancel</span>, schema: "gray" }),
  });

  const submit = isolate(
    Button,
    "submit"
  )({
    ...sources,
    testid: gen("submit"),
    props: sources.state
      .select<UserConfigurationState["allowSubmit"]>("allowSubmit")
      .stream.map<ButtonProps>((allowSubmit) => ({
        content: <span>Apply</span>,
        schema: "primary",
        type: "submit",
        disabled: !allowSubmit,
      })),
  });

  const actions = intent(sources);
  const state$ = model(actions);

  const submit$ = submit.click
    .map(() => {
      return state$
        .filter(({ allowSubmit }) => allowSubmit)
        .map(({ jiraToken, email, userDomain }) => ({
          jiraToken,
          email,
          userDomain,
        }))
        .take(1);
    })
    .flatten();

  const cancel$ = cancel.click.mapTo(true);

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
        draft.allowSubmit = canSubmit({ jiraToken: draft.jiraToken, userDomain: draft.userDomain, email: draft.email });
      });
    };
  });

  const stateReducer$ = xs
    .combine(email.input, userDomain.input, jiraToken.input)
    .map<Reducer<UserConfigurationState>>(([email, userDomain, jiraToken]) => {
      return (prevState) => {
        if (!prevState) return;

        return produce(prevState, (draft) => {
          draft.jiraToken = jiraToken;
          draft.userDomain = userDomain;
          draft.email = email;
          draft.allowSubmit = canSubmit({
            jiraToken: draft.jiraToken,
            userDomain: draft.userDomain,
            email: draft.email,
          });
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
      gen
    ),
    value: submit$,
    cancel: cancel$,
    state: xs.merge(initialReducer$, propsReducer$, stateReducer$),
  };
};
