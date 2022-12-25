import { jsx, Fragment } from "snabbdom"; // eslint-disable-line
import xs, { Stream } from "xstream";
import isolate from "@cycle/isolate";
import { Reducer, StateSource } from "@cycle/state";
import { Input, InputProps, InputSinks } from "./atoms/input";
import { Button, ButtonProps } from "./atoms/button";
import { AsNodeStream, mergeNodes, portalSourceOf, simpleReduce } from "./helper";
import { ComponentSink, ComponentSource, classes, generateTestId } from "@/components/helper";
import { filterEmptyString, Rect } from "@/util/basic";

export type UserConfigurationValue = {
  jiraToken: string;
  email: string;
  userDomain: string;
};

type State = {
  value: UserConfigurationValue;
  allowSubmit: boolean;
  opened: boolean;
  openAt?: Rect;
};

export interface Props {
  initialValue: Stream<Partial<UserConfigurationValue>>;
  openAt: Stream<Rect>;
}

interface Sources extends ComponentSource {
  props: Props;
  state: StateSource<State>;
}

interface Sinks extends ComponentSink<"Portal"> {
  /**
   * streaming values when value submitted
   */
  value: Stream<UserConfigurationValue>;
  state: Stream<Reducer<State>>;
}

const intent = (sources: Sources) => {
  const submit$ = portalSourceOf(sources)
    .DOM.select("form")
    .events("submit", { preventDefault: true, bubbles: false })
    .mapTo(true);

  return {
    submit$,
  };
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
        "overflow-hidden",
      ),
      ...(!opened ? classes("w-0") : {}),
      ...(opened ? classes("w-96") : {}),
    };
  },
};

const view = (
  state$: Stream<State>,
  nodes$: AsNodeStream<["jiraToken", "email", "userDomain", "submit", "cancel"]>,
  gen: ReturnType<typeof generateTestId>,
) => {
  return xs.combine(state$, nodes$).map(([{ opened, openAt }, nodes]) => {
    const top = openAt ? `calc(${openAt.top + openAt.height}px)` : "";

    return (
      <div
        class={{ ...Styles.dialogContainer(opened), "--opened": opened }}
        style={{ top }}
        dataset={{ testid: gen("dialog-container"), id: "root" }}
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
  sources: Sources,
  email: InputSinks,
  userDomain: InputSinks,
  jiraToken: InputSinks,
) => {
  const initialReducer$ = xs.of<Reducer<State>>(() => {
    return {
      value: {
        jiraToken: "",
        userDomain: "",
        email: "",
      },
      allowSubmit: false,
      opened: false,
    };
  });

  const openedReducer$ = xs.merge(submit$.mapTo(false), cancel$.mapTo(false)).map(
    simpleReduce<State, boolean>((draft, opened) => {
      draft.opened = opened;
    }),
  );

  const openAtReducer$ = sources.props.openAt.map(
    simpleReduce<State, Rect>((draft, openAt) => {
      draft.openAt = openAt;
      draft.opened = true;
    }),
  );

  const propsReducer$ = sources.props.initialValue.take(1).map(
    simpleReduce<State, Partial<UserConfigurationValue>>((draft, props) => {
      draft.value.jiraToken = props.jiraToken ?? "";
      draft.value.userDomain = props.userDomain ?? "";
      draft.value.email = props.email ?? "";
      draft.allowSubmit = canSubmit({ ...draft.value });
    }),
  );

  const stateReducer$ = xs.combine(email.input, userDomain.input, jiraToken.input).map(
    simpleReduce<State, [string, string, string]>((draft, [email, userDomain, jiraToken]) => {
      draft.value.jiraToken = jiraToken;
      draft.value.userDomain = userDomain;
      draft.value.email = email;
      draft.allowSubmit = canSubmit({ ...draft.value });
    }),
  );

  return xs.merge(initialReducer$, propsReducer$, stateReducer$, openAtReducer$, openedReducer$);
};

export const UserConfigurationDialog = (sources: Sources): Sinks => {
  const gen = generateTestId(sources.testid);
  const userDomain = isolate(
    Input,
    "userDomain",
  )({
    DOM: portalSourceOf(sources).DOM,
    testid: gen("user-domain"),
    props: sources.props.initialValue.take(1).map<InputProps>(({ userDomain }) => {
      return {
        placeholder: "e.g. your-domain",
        value: userDomain ?? "",
        label: "User Domain",
      };
    }),
  });

  const email = isolate(
    Input,
    "email",
  )({
    DOM: portalSourceOf(sources).DOM,
    testid: gen("email"),
    props: sources.props.initialValue.take(1).map<InputProps>(({ email }) => {
      return {
        placeholder: "e.g. your@example.com",
        value: email ?? "",
        label: "Email",
      };
    }),
  });

  const jiraToken = isolate(
    Input,
    "jiraToken",
  )({
    DOM: portalSourceOf(sources).DOM,
    testid: gen("jira-token"),
    props: sources.props.initialValue.take(1).map<InputProps>(({ jiraToken }) => {
      return {
        placeholder: "required",
        value: jiraToken ?? "",
        label: "Credential",
      };
    }),
  });

  const cancel = isolate(
    Button,
    "cancel",
  )({
    DOM: portalSourceOf(sources).DOM,
    testid: gen("cancel"),
    props: xs.of<ButtonProps>({ content: <>Cancel</>, schema: "gray" }),
  });

  const submit = isolate(
    Button,
    "submit",
  )({
    DOM: portalSourceOf(sources).DOM,
    testid: gen("submit"),
    props: sources.state.select<State["allowSubmit"]>("allowSubmit").stream.map<ButtonProps>((allowSubmit) => ({
      content: <>Apply</>,
      schema: "primary",
      type: "submit",
      disabled: !allowSubmit,
    })),
  });

  const actions = intent(sources);

  const submit$ = sources.state.stream
    .filter(({ allowSubmit }) => allowSubmit)
    .map(({ value }) => {
      return xs.merge(actions.submit$, submit.click).take(1).mapTo(value);
    })
    .flatten();

  const cancel$ = cancel.click;
  const reducer = reduceState(submit$, cancel$, sources, email, userDomain, jiraToken);

  return {
    Portal: {
      root: view(
        sources.state.stream,
        mergeNodes({
          jiraToken,
          email,
          userDomain,
          submit,
          cancel,
        }),
        gen,
      ),
    },
    value: submit$,
    state: reducer,
  };
};
