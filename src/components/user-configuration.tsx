import { jsx, VNode } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import xs, { Stream } from "xstream";
import { AsNodeStream, classes, generateTestId, mergeNodes, selectAsMain } from "@/components/helper";
import { ComponentSinks, ComponentSources } from "@/components/type";
import { UserConfigurationDialog, UserConfigurationValue } from "@/components/user-configuration-dialog";
import isolate from "@cycle/isolate";
import { Setting } from "@/model/setting";
import { filterUndefined } from "@/util/basic";
import { Reducer, StateSource } from "@cycle/state";
import { Icon, IconProps } from "./atoms/icon";

export type UserConfigurationProps = {
  setting: Setting;
  setupFinished: boolean;
};

type State = {
  userConfigurationDialog: UserConfigurationValue;
};

type UserConfigurationSources = ComponentSources<{
  props: Stream<UserConfigurationProps>;
  state: StateSource<State>;
}>;

type UserConfigurationSinks = ComponentSinks<{
  value: Stream<UserConfigurationValue>;
  state: Stream<Reducer<State>>;
}>;

const intent = function intent(sources: UserConfigurationSources, dialogValue: Stream<any>) {
  const clickOpener$ = selectAsMain(sources, ".--opener").events("click", { bubbles: false }).mapTo(true);
  const dialogApplied$ = dialogValue.mapTo(false);

  return {
    clickOpener$,
    dialogApplied$,
    props$: sources.props,
  };
};

const model = function model(actions: ReturnType<typeof intent>) {
  return actions.props$
    .map((props) => {
      const opened$ = xs.merge(actions.clickOpener$, actions.dialogApplied$).fold((_accum, toggle) => toggle, false);

      return opened$.map((opened) => {
        return { opened, setupFinished: props.setupFinished };
      });
    })
    .flatten();
};

const Styles = {
  root: classes("flex", "relative", "top-4", "right-4"),
  toolbar: classes(
    "flex",
    "relative",
    "flex-auto",
    "flex-col",
    "bg-white",
    "rounded",
    "shadow-md",
    "w-12",
    "h-12",
    "p-3",
    "justify-center"
  ),
  opener: () => {
    return {
      ...classes("relative", "outline-none", "bg-white", "border-none", "flex-auto", "flex", "w-7", "h-7"),
    };
  },
  marker: (show: boolean) => {
    return {
      ...classes("absolute", "top-0", "left-0", "inline-block", "bg-primary-400", "w-2", "h-2", "rounded-full"),
      ...(!show ? classes("invisible") : {}),
      ...(show ? classes("visible") : {}),
    };
  },
  dialogContainer: (opened: boolean) => {
    return {
      ...classes(
        "bg-white",
        "absolute",
        "top-full",
        "right-0",
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
  nodes: AsNodeStream<["dialog", "openerIcon"]>,
  gen: ReturnType<typeof generateTestId>
) {
  return xs.combine(state$, nodes).map(([{ opened, setupFinished }, { dialog, openerIcon }]) => (
    <div class={Styles.root}>
      <div class={Styles.toolbar}>
        <button class={{ ...Styles.opener(), "--opener": true }} dataset={{ testid: gen("opener") }}>
          <span class={Styles.marker(!setupFinished)} dataset={{ testid: gen("marker") }}></span>
          {openerIcon}
        </button>
      </div>
      <div class={Styles.dialogContainer(opened)} dataset={{ testid: gen("dialog-container") }}>
        {dialog}
      </div>
    </div>
  ));
};

export const UserConfiguration = function UserConfiguration(sources: UserConfigurationSources): UserConfigurationSinks {
  const gen = generateTestId(sources.testid);
  const dialog = isolate(
    UserConfigurationDialog,
    "userConfigurationDialog"
  )({
    ...sources,
    props: sources.props.map<Partial<UserConfigurationValue>>((v) => ({
      userDomain: v.setting.userDomain,
      email: v.setting.credentials.email,
      jiraToken: v.setting.credentials.jiraToken,
    })),
    testid: gen("dialog"),
  });

  const openerIcon = Icon({
    ...sources,
    props: xs.of<IconProps>({
      type: "settings",
      color: "complement",
      size: "l",
    }),
  });

  const actions = intent(sources, dialog.value);
  const state$ = model(actions);

  return {
    DOM: view(state$, mergeNodes({ dialog: dialog.DOM, openerIcon: openerIcon.DOM }), gen),
    value: dialog.value
      .map((v) => {
        if (v.kind === "submit") {
          return v.state;
        }
        return;
      })
      .filter(filterUndefined),
    state: xs.merge(dialog.state as Stream<Reducer<State>>),
  };
};
