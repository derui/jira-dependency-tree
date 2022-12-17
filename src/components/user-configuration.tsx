import { jsx, VNode } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import xs, { Stream } from "xstream";
import { classes, generateTestId, selectAsMain } from "@/components/helper";
import { ComponentSinks, ComponentSources } from "@/components/type";
import { UserConfigurationDialog, UserConfigurationState } from "@/components/user-configuration-dialog";
import isolate from "@cycle/isolate";
import { Setting } from "@/model/setting";
import { filterUndefined } from "@/util/basic";

export type UserConfigurationProps = {
  setting: Setting;
  setupFinished: boolean;
};

type UserConfigurationSources = ComponentSources<{
  props: Stream<UserConfigurationProps>;
}>;

type UserConfigurationSinks = ComponentSinks<{
  value: Stream<UserConfigurationState>;
}>;

const intent = function intent(sources: UserConfigurationSources, dialogValue: Stream<any>) {
  const clickOpener$ = selectAsMain(sources, ".user-configuration__opener")
    .events("click", { bubbles: false })
    .mapTo(true);
  const dialogApplied$ = dialogValue.mapTo(false);

  return {
    clickOpener$,
    dialogApplied$,
    props$: sources.props,
  };
};

const model = function model(actions: ReturnType<typeof intent>, dialog: Stream<VNode>) {
  return actions.props$
    .map((props) => {
      const opened = xs.merge(actions.clickOpener$, actions.dialogApplied$).fold((_accum, toggle) => toggle, false);

      return xs
        .combine(opened, dialog)
        .map(([opened, dialog]) => ({ opened, setupFinished: props.setupFinished, nodes: { dialog } }));
    })
    .flatten();
};

const Styles = {
  root: classes("flex", "relative"),
  toolbar: classes("flex", "relative", "flex-auto", "flex-col", "bg-white", "p-3"),
  opener: (opened: boolean) => {
    return {
      ...classes(
        "relative",
        "outline-none",
        "bg-white",
        "border-none",
        "flex-auto",
        "flex",
        "p-2",
        "transition-colors",
        "cursor-pointer",
        "color-black",
        "rounded",
        "hover:bg-secondary1-400"
      ),
      ...(opened ? classes("bg-secondary1-400") : {}),
    };
  },
  marker: (show: boolean) => {
    return {
      ...classes("absolute", "top-0", "left-0", "inline-block", "invisible", "bg-primary-400", "w-3", "h-4", "rounded"),
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
        "width-0",
        "overflow-hidden"
      ),
      ...(opened ? classes("width-[360px]") : {}),
    };
  },
};

const view = function view(state$: ReturnType<typeof model>, gen: ReturnType<typeof generateTestId>) {
  return state$.map(({ opened, setupFinished, nodes: { dialog } }) => (
    <div class={Styles.root}>
      <div class={Styles.toolbar}>
        <button class={Styles.opener(opened)} dataset={{ testid: gen("opener") }}>
          <span class={Styles.marker(!setupFinished)} dataset={{ testid: gen("marker") }}></span>
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
    DOM: sources.DOM,
    props: sources.props.map<Partial<UserConfigurationState>>((v) => ({
      userDomain: v.setting.userDomain,
      email: v.setting.credentials.email,
      jiraToken: v.setting.credentials.jiraToken,
    })),
    testid: gen("dialog"),
  });

  const actions = intent(sources, dialog.value);
  const state$ = model(actions, dialog.DOM);

  return {
    DOM: view(state$, gen),
    value: dialog.value
      .map((v) => {
        if (v.kind === "submit") {
          return v.state;
        }
        return;
      })
      .filter(filterUndefined),
  };
};
