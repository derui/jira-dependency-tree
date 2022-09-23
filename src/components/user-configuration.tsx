import { jsx, VNode } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import xs, { Stream } from "xstream";
import { selectAsMain } from "@/components/helper";
import { ComponentSinks, ComponentSources } from "@/components/type";
import { UserConfigurationDialog, UserConfigurationState } from "@/components/user-configuration-dialog";
import isolate from "@cycle/isolate";
import { Setting } from "@/model/setting";
import { source } from "@cycle/dom";

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

const intent = function intent(sources: UserConfigurationSources, dialogValue: Stream<UserConfigurationState>) {
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

const model = function model(actions: ReturnType<typeof intent>) {
  const opened = xs
    .merge(actions.clickOpener$, actions.dialogApplied$)
    .fold((accum, toggle) => (toggle ? !accum : toggle), false);

  return xs.combine(opened, actions.props$).map(([opened, { setupFinished }]) => ({ opened, setupFinished }));
};

const view = function view(state$: ReturnType<typeof model>, dialog: Stream<VNode>) {
  return xs.combine(state$, dialog).map(([{ opened, setupFinished }, dialog]) => (
    <div class={{ "user-configuration": true }}>
      <div class={{ "user-configuration__toolbar": true }}>
        <span
          class={{ "user-configuration__marker": true, "--show": !setupFinished }}
          dataset={{ testid: "marker" }}
        ></span>

        <button
          class={{ "user-configuration__opener": true, "--opened": opened }}
          dataset={{ testid: "opener" }}
        ></button>
      </div>
      <div
        class={{
          "user-configuration__dialog-container": true,
          "--hidden": !opened,
        }}
        dataset={{ testid: "dialog" }}
      >
        {dialog}
      </div>
    </div>
  ));
};

export const UserConfiguration = function UserConfiguration(sources: UserConfigurationSources): UserConfigurationSinks {
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
  });

  const actions = intent(sources, dialog.value);
  const state$ = model(actions);

  return {
    DOM: view(state$, dialog.DOM),
    value: dialog.value,
  };
};
