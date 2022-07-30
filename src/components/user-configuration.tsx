import { jsx, VNode } from "snabbdom"; // eslint-disable-line unused-imports/no-unused-imports
import xs, { Stream } from "xstream";
import { selectAsMain } from "@/components/helper";
import { ComponentSinks, ComponentSources } from "@/components/type";
import { UserConfigurationDialog, UserConfigurationState } from "./user-configuration-dialog";
import isolate from "@cycle/isolate";

type UserConfigurationSources = ComponentSources<{}>;

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
  };
};

const model = function model(actions: ReturnType<typeof intent>) {
  return xs
    .merge(actions.clickOpener$, actions.dialogApplied$)
    .fold((accum, toggle) => (toggle ? !accum : toggle), false)
    .map((v) => ({ opened: v }));
};

const view = function view(state$: ReturnType<typeof model>, dialog: Stream<VNode>) {
  return xs.combine(state$, dialog).map(([{ opened }, dialog]) => (
    <div class={{ "user-configuration": true }}>
      <div class={{ "user-configuration__toolbar": true }}>
        <span>
          <button
            class={{ "user-configuration__opener": true, "--opened": opened }}
            dataset={{ testid: "opener" }}
          ></button>
        </span>
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
  const dialog = isolate(UserConfigurationDialog, "userConfigurationDialog")(sources);

  const actions = intent(sources, dialog.value);
  const state$ = model(actions);

  return {
    DOM: view(state$, dialog.DOM),
    value: dialog.value,
  };
};
