import { jsx } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { Stream } from "xstream";
import { classes, generateTestId } from "../helper";
import { ComponentSinkBase, ComponentSourceBase } from "../type";

type IconSize = "s" | "m" | "l";

interface IconProps {
  size?: IconSize;
  type: string;
  style?: Record<string, boolean>;
}

interface IconSources extends ComponentSourceBase {
  props: Stream<IconProps>;
}

const intent = (sources: IconSources) => {
  return {
    props$: sources.props,
  };
};

const model = (actions: ReturnType<typeof intent>) => {
  return actions.props$.map((props) => {
    return { size: props.size ?? "s", type: props.type, style: props.style ?? {} };
  });
};

const typeClass = (type: string) => {
  return classes(`[mask:url(/assets/svg/tablar-icons/${type}.svg)]`, "[mask-size:cover]");
};

const iconBaseClass = classes("flex-none", "flex", "items-center", "justify-center");

const sizeClass = (size: IconSize) => {
  switch (size) {
    case "l":
      return largeIconClass;
    case "m":
      return mediumIconClass;
    case "s":
      return smallIconClass;
  }
};

const smallIconClass = classes("w-4", "h-4");
const mediumIconClass = classes("w-5", "h-5");
const largeIconClass = classes("w-6", "h-6");

const view = (state$: ReturnType<typeof model>, gen: ReturnType<typeof generateTestId>) => {
  return state$.map(({ size, type, style }) => {
    const iconClass = {
      ...iconBaseClass,
      ...sizeClass(size),
      ...typeClass(type),
      ...style,
    };

    return <span class={iconClass} dataset={{ testid: gen("icon") }}></span>;
  });
};

export const Icon = (sources: IconSources): ComponentSinkBase => {
  const gen = generateTestId(sources.testid);
  const actions = intent(sources);
  const state$ = model(actions);

  return {
    DOM: view(state$, gen),
  };
};
