import { jsx } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import xs, { Stream } from "xstream";
import isolate from "@cycle/isolate";
import { Reducer, StateSource } from "@cycle/state";
import { Icon, IconProps } from "./atoms/icon";
import { UserConfigurationDialog, UserConfigurationValue } from "./user-configuration-dialog";
import {
  AsNodeStream,
  classes,
  domSourceOf,
  generateTestId,
  mergeNodes,
  ComponentSink,
  ComponentSource,
  simpleReduce,
} from "@/components/helper";
import { Rect } from "@/util/basic";
import { Setting, settingFactory } from "@/model/setting";

export interface State {
  setting: Setting;
  setupFinished: boolean;
}

export type UserConfigurationProps = {
  initialSetting: Stream<Setting>;
};

interface UserConfigurationSources extends ComponentSource {
  props: UserConfigurationProps;
  state: StateSource<State>;
}

interface UserConfigurationSinks extends ComponentSink<"DOM">, ComponentSink<"Portal"> {
  value: Stream<Setting>;
  state: Stream<Reducer<State>>;
}

const intent = (sources: UserConfigurationSources) => {
  const root$ = domSourceOf(sources).select('[data-id="root"]').element();
  const clickOpener$ = domSourceOf(sources).select('[data-id="opener"]').events("click", { bubbles: false });

  return {
    clickOpener$,
    root$,
  };
};

const Styles = {
  root: classes("flex", "relative"),
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
    "justify-center",
  ),
  opener: () => {
    return {
      ...classes("relative", "outline-none", "bg-white", "border-none", "flex-auto", "flex", "w-7", "h-7"),
    };
  },
  marker: (setupped: boolean) => {
    return {
      ...classes("absolute", "top-0", "left-0", "inline-block", "bg-primary-400", "w-2", "h-2", "rounded-full"),
      ...(!setupped ? classes("invisible") : {}),
      ...(setupped ? classes("visible") : {}),
    };
  },
};

const view = (state$: Stream<State>, nodes: AsNodeStream<["openerIcon"]>, gen: ReturnType<typeof generateTestId>) => {
  return xs.combine(state$, nodes).map(([{ setupFinished }, { openerIcon }]) => (
    <div class={Styles.root}>
      <div class={Styles.toolbar} dataset={{ id: "root" }}>
        <button class={{ ...Styles.opener() }} dataset={{ testid: gen("opener"), id: "opener" }}>
          <span
            class={{ ...Styles.marker(!setupFinished), "--show": !setupFinished }}
            dataset={{ testid: gen("marker") }}
          ></span>
          {openerIcon}
        </button>
      </div>
    </div>
  ));
};

export const UserConfiguration = (sources: UserConfigurationSources): UserConfigurationSinks => {
  const gen = generateTestId(sources.testid);
  const openerIcon = Icon({
    ...sources,
    props: xs.of<IconProps>({
      type: "settings",
      color: "complement",
      size: "l",
    }),
  });

  const actions = intent(sources);

  const dialog = isolate(
    UserConfigurationDialog,
    "userConfigurationDialog",
  )({
    ...sources,
    props: {
      initialValue: sources.props.initialSetting
        .map<Partial<UserConfigurationValue>>((settings) => {
          return {
            jiraToken: settings.toArgument().credentials?.jiraToken,
            email: settings.toArgument().credentials?.email,
            userDomain: settings.toArgument().userDomain,
          };
        })
        .startWith({}),
      openAt: actions.clickOpener$
        .map(() => {
          return actions.root$
            .map((e) => {
              const rect = e.getBoundingClientRect();

              return new Rect({
                top: rect.top,
                left: rect.left,
                right: rect.right,
                bottom: rect.bottom,
              });
            })
            .take(1);
        })
        .flatten(),
    },
  });

  const initialReducer$ = xs.of<Reducer<State>>(() => {
    return { setupFinished: false, setting: settingFactory({}) };
  });

  const propReducer$ = sources.props.initialSetting.take(1).map(
    simpleReduce<State, Setting>((draft, setting) => {
      draft.setting = setting;
      draft.setupFinished = setting.isSetupFinished();
    }),
  );

  const valueReducer$ = dialog.value.map(
    simpleReduce<State, UserConfigurationValue>((draft, value) => {
      draft.setting = draft.setting.applyCredentials(value.jiraToken, value.email).applyUserDomain(value.userDomain);
      draft.setupFinished = true;
    }),
  );

  return {
    DOM: view(sources.state.stream, mergeNodes({ openerIcon }), gen),
    Portal: dialog.Portal,
    value: sources.state.stream.filter(({ setupFinished }) => setupFinished).map((v) => v.setting),
    state: xs.merge(initialReducer$, propReducer$, valueReducer$, dialog.state as Stream<Reducer<State>>),
  };
};
