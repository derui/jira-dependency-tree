import { jsx } from "snabbdom"; // eslint-disable-line
import xs, { Stream } from "xstream";
import isolate from "@cycle/isolate";
import { Reducer, StateSource } from "@cycle/state";
import produce from "immer";
import { Input, InputProps, InputSinks } from "./atoms/input";
import { Button, ButtonProps } from "./atoms/button";
import { AsNodeStream, mergeNodes, portalSourceOf } from "./helper";
import { ComponentSink, ComponentSource, classes, generateTestId } from "@/components/helper";
import { filterEmptyString, filterUndefined, Rect } from "@/util/basic";

export type UserConfigurationValue = {
  jiraToken: string;
  email: string;
  userDomain: string;
};

type UserConfigurationState = UserConfigurationValue & {
  allowSubmit: boolean;
  opened: boolean;
};

export type Props = Partial<UserConfigurationValue> & { openAt?: Rect };

interface UserConfigurationDialogSources extends ComponentSource {
  props: Stream<Props>;
  state: StateSource<UserConfigurationState>;
}

interface UserConfigurationDialogSinks extends ComponentSink<"Portal"> {
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
  const submit$ = portalSourceOf(sources)
    .DOM.select('[data-id="form"]')
    .events("submit", { preventDefault: true, bubbles: false })
    .mapTo(true);

  return {
    submit$,
    props$: sources.props,
    state: sources.state,
  };
};

const model = (actions: ReturnType<typeof intent>) => {
  return actions.props$
    .map((props) => {
      return xs.combine(actions.state.select<boolean>("opened").stream).map(([opened]) => {
        return {
          opened: opened,
          openAt: props.openAt,
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
        "right-3",
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

const view = (
  state$: ReturnType<typeof model>,
  nodes$: AsNodeStream<["jiraToken", "email", "userDomain", "submit", "cancel"]>,
  gen: ReturnType<typeof generateTestId>
) => {
  return xs.combine(state$, nodes$).map(([{ opened, openAt }, nodes]) => {
    const top = openAt ? `calc(${openAt.top + openAt.height}px)` : "";
    console.log(top);

    return (
      <div
        class={Styles.dialogContainer(opened)}
        style={{ top }}
        dataset={{ testid: gen("dialog-container"), id: "root", opened: `${opened}` }}
      >
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
    );
  });
};

const canSubmit: (args: { jiraToken: string; email: string; userDomain: string }) => boolean = ({
  jiraToken,
  email,
  userDomain,
}) => {
  return filterEmptyString(jiraToken) && filterEmptyString(email) && filterEmptyString(userDomain);
};

const reduceState = (
  submit$: Stream<{ jiraToken: string; email: string; userDomain: string }>,
  cancel$: Stream<boolean>,
  sources: UserConfigurationDialogSources,
  email: InputSinks,
  userDomain: InputSinks,
  jiraToken: InputSinks
) => {
  const initialReducer$ = xs.of<Reducer<UserConfigurationState>>(() => {
    return {
      jiraToken: "",
      userDomain: "",
      email: "",
      allowSubmit: false,
      opened: false,
    };
  });

  const openedReducer$ = xs
    .merge(
      submit$.mapTo(false),
      cancel$.mapTo(false),
      sources.props
        .map((v) => v.openAt)
        .filter(filterUndefined)
        .mapTo(true)
    )
    .map<Reducer<UserConfigurationState>>((opened) => {
      return (prevState) => {
        if (!prevState) return;

        return produce(prevState, (draft) => {
          draft.opened = opened;
        });
      };
    });

  const propsReducer$ = sources.props
    .filter((props) => {
      return (
        !filterEmptyString(props.email) && !filterEmptyString(props.jiraToken) && !filterEmptyString(props.userDomain)
      );
    })
    .map<Reducer<UserConfigurationState>>((props) => {
      return (prevState) => {
        if (!prevState) return;

        return produce(prevState, (draft) => {
          draft.jiraToken = props.jiraToken ?? "";
          draft.userDomain = props.userDomain ?? "";
          draft.email = props.email ?? "";
          draft.allowSubmit = canSubmit({
            jiraToken: draft.jiraToken,
            userDomain: draft.userDomain,
            email: draft.email,
          });
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

  return xs.merge(initialReducer$, propsReducer$, stateReducer$, openedReducer$);
};

export const UserConfigurationDialog = (sources: UserConfigurationDialogSources): UserConfigurationDialogSinks => {
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

  const submit$ = actions.submit$
    .map(() => {
      return sources.state.stream
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
  const reducer = reduceState(submit$, cancel$, sources, email, userDomain, jiraToken);

  return {
    Portal: view(
      state$,
      mergeNodes({
        jiraToken,
        email,
        userDomain,
        submit,
        cancel,
      }),
      gen
    ),
    value: submit$,
    cancel: cancel$,
    state: reducer,
  };
};
