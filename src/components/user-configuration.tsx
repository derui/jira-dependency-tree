import { jsx, VNode } from "snabbdom"; // eslint-disable-line unused-imports/no-unused-imports
import xs, { Stream } from "xstream";
import { selectAsMain } from "@/components/helper";
import { ComponentSinks, ComponentSources } from "@/components/type";
import { UserConfigurationState } from "./user-configuration-dialog";
import isolate from "@cycle/isolate";

type UserConfigurationSources = ComponentSources<{}>;

type UserConfigurationSinks = ComponentSinks<{
  value: Stream<UserConfigurationState>;
}>;

const intent = function intent(sources: UserConfigurationSources) {
  const clickOpener$ = selectAsMain(sources, ".user-configuration__opener").events("click", { bubbles: false });

  return {
    clickOpener$,
  };
};

const model = function model(actions: ReturnType<typeof intent>) {
  return actions.clickOpener$
    .fold((accum) => !accum, false)
    .map((v) => ({ opened: v }))
    .remember();
};

const view = function view(state$: ReturnType<typeof model>, dialog: Stream<VNode>) {
  return xs.combine(state$, dialog).map(([{ opened }, dialog]) => (
    <div class={{ "user-configuration": true }}>
      <div class={{ "user-configuration__toolbar": true }}>
        <span>
          <button class={{ "user-configuration__opener": true, "user-configuration__opener--opened": opened }}>
            Open
          </button>
        </span>
      </div>
      <div
        class={{
          "user-configuration__dialog-container": true,
          "user-configuration__dialog-container--hidden": !opened,
        }}
      >
        {dialog}
      </div>
    </div>
  ));
};

export const UserConfigurationDialog = function UserConfigurationDialog(
  sources: UserConfigurationSources
): UserConfigurationSinks {
  const dialog = isolate(UserConfigurationDialog, "userConfigurationDialog")(sources);

  const actions = intent(sources);
  const state$ = model(actions);

  return {
    DOM: view(state$, dialog.DOM),
    value: dialog.value,
  };
};
