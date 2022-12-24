import { jsx } from "snabbdom"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { Stream } from "xstream";
import { classes, generateTestId, ComponentSink, ComponentSource } from "../helper";

type IconSize = "s" | "m" | "l";

type Color = "primary" | "secondary1" | "gray" | "secondary2" | "complement";

export interface IconProps {
  size?: IconSize;
  type: string;
  color?: Color;
  style?: Record<string, boolean>;
}

interface IconSources extends ComponentSource {
  props: Stream<IconProps>;
}

const icons: Record<string, string> = {
  "chevron-down": "before:[mask:url(/assets/svg/tablar-icons/chevron-down.svg)]",
  "door-exit": "before:[mask:url(/assets/svg/tablar-icons/door-exit.svg)]",
  "layout-2": "before:[mask:url(/assets/svg/tablar-icons/layout-2.svg)]",
  "layout-distribute-horizontal": "before:[mask:url(/assets/svg/tablar-icons/layout-distribute-horizontal.svg)]",
  "layout-distribute-vertical": "before:[mask:url(/assets/svg/tablar-icons/layout-distribute-vertical.svg)]",
  refresh: "before:[mask:url(/assets/svg/tablar-icons/refresh.svg)]",
  search: "before:[mask:url(/assets/svg/tablar-icons/search.svg)]",
  settings: "before:[mask:url(/assets/svg/tablar-icons/settings.svg)]",
  "square-check": "before:[mask:url(/assets/svg/tablar-icons/square-check.svg)]",
  square: "before:[mask:url(/assets/svg/tablar-icons/square.svg)]",
  "circle-x": "before:[mask:url(/assets/svg/tablar-icons/circle-x.svg)]",
  "circle-check": "before:[mask:url(/assets/svg/tablar-icons/circle-check.svg)]",
};

const colors: Record<string, Record<string, boolean>> = {
  primary: classes("before:bg-darkgray", "before:hover:bg-primary-300", "before:active:bg-primary-500"),
  secondary1: classes("before:bg-darkgray", "before:hover:bg-secondary1-200", "before:active:bg-secondary1-500"),
  secondary2: classes("before:bg-darkgray", "before:hover:bg-secondary2-200", "before:active:bg-secondary2-500"),
  complement: classes("before:bg-darkgray", "before:hover:bg-complement-200", "before:active:bg-complement-500"),
  gray: classes("before:bg-gray", "before:hover:bg-darkgray", "before:active:bg-black"),
};

const Styles = {
  type: (type: string) => {
    return classes(icons[type], "before:[mask-size:cover]", "before:[mask-repeat:round]");
  },

  iconBase: classes(
    "transition-colors",
    "bg-none",
    "flex",
    "items-center",
    "justify-center",
    "rounded",
    "before:content-['']",
    "before:inline-block",
    "before:flex-none",
    "before:w-full",
    "before:h-full",
    "before:transition-colors",
  ),

  size: (size: IconSize) => {
    switch (size) {
      case "l":
        return classes("w-7", "h-7");
      case "m":
        return classes("w-6", "h-6");
      case "s":
        return classes("w-5", "h-5");
    }
  },

  color: (color: Color) => {
    return colors[color];
  },
};

const view = (state$: Stream<Required<IconProps>>, gen: ReturnType<typeof generateTestId>) => {
  return state$.map(({ size, type, style, color }) => {
    const iconClass = {
      ...Styles.iconBase,
      ...Styles.size(size),
      ...Styles.type(type),
      ...Styles.color(color),
      ...style,
    };

    return <span class={iconClass} dataset={{ testid: gen("icon"), type, color, size }}></span>;
  });
};

/**
 * do not have any behavior in this component. You do not use this component with `isolate`, then you found problem can not get any bubbling event.
 */
export const Icon = (sources: IconSources): ComponentSink<"DOM"> => {
  const gen = generateTestId(sources.testid);
  const state$ = sources.props.map((props) => {
    return { size: props.size ?? "s", type: props.type, style: props.style ?? {}, color: props.color ?? "primary" };
  });

  return {
    DOM: view(state$, gen),
  };
};
