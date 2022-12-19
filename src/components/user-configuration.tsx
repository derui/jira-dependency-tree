import { jsx, VNode } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import xs, { Stream } from "xstream";
import { Icon, IconProps } from "./atoms/icon";
import { AsNodeStream, classes, generateTestId, mergeNodes, selectAsMain } from "@/components/helper";
import { ComponentSinks, ComponentSources } from "@/components/type";
import { Rect } from "@/util/basic";

export type UserConfigurationProps = {
  setupFinished: boolean;
};

type UserConfigurationSources = ComponentSources<{
  props: Stream<UserConfigurationProps>;
}>;

type UserConfigurationSinks = ComponentSinks<{
  /**
   * streaming Rect of element when it was clicked
   */
  click: Stream<Rect>;
}>;

const intent = (sources: UserConfigurationSources) => {
  const root$ = selectAsMain(sources, '[data-id="root"]').element();
  const clickOpener$ = selectAsMain(sources, '[data-id="opener"]').events("click", { bubbles: false });

  return {
    clickOpener$,
    root$,
    props$: sources.props,
  };
};

const model = (actions: ReturnType<typeof intent>) => {
  return actions.props$.map((props) => {
    return { setupFinished: props.setupFinished };
  });
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
    "justify-center"
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

const view = function view(
  state$: ReturnType<typeof model>,
  nodes: AsNodeStream<["openerIcon"]>,
  gen: ReturnType<typeof generateTestId>
) {
  return xs.combine(state$, nodes).map(([{ setupFinished }, { openerIcon }]) => (
    <div class={Styles.root} dataset={{ id: "root" }}>
      <div class={Styles.toolbar}>
        <button class={{ ...Styles.opener() }} dataset={{ testid: gen("opener"), id: "opener" }}>
          <span
            class={Styles.marker(!setupFinished)}
            dataset={{ testid: gen("marker"), show: `${!setupFinished}` }}
          ></span>
          {openerIcon}
        </button>
      </div>
    </div>
  ));
};

export const UserConfiguration = function UserConfiguration(sources: UserConfigurationSources): UserConfigurationSinks {
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
  const state$ = model(actions);

  return {
    DOM: view(state$, mergeNodes({ openerIcon: openerIcon.DOM }), gen),
    click: actions.clickOpener$
      .map(() => {
        return actions.root$.map((e) => {
          const rect = e.getBoundingClientRect();

          return new Rect({
            top: rect.top,
            left: rect.left,
            right: rect.right,
            bottom: rect.bottom,
          });
        });
      })
      .flatten(),
  };
};
