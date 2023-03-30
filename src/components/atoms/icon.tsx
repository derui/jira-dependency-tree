import classNames from "classnames";
import { BaseProps, classes } from "../helper";

type IconSize = "s" | "m" | "l";

type Color = "primary" | "secondary1" | "gray" | "secondary2" | "complement";

export interface Props extends BaseProps {
  size?: IconSize;
  type: Icons;
  color?: Color;
  style?: Record<string, boolean>;
  disabled?: boolean;
  active?: boolean;
}

const Icons = {
  "chevron-down": "before:[mask-image:url(/assets/svg/tablar-icons/chevron-down.svg)]",
  "door-exit": "before:[mask-image:url(/assets/svg/tablar-icons/door-exit.svg)]",
  "layout-2": "before:[mask-image:url(/assets/svg/tablar-icons/layout-2.svg)]",
  "layout-distribute-horizontal": "before:[mask-image:url(/assets/svg/tablar-icons/layout-distribute-horizontal.svg)]",
  "layout-distribute-vertical": "before:[mask-image:url(/assets/svg/tablar-icons/layout-distribute-vertical.svg)]",
  refresh: "before:[mask-image:url(/assets/svg/tablar-icons/refresh.svg)]",
  search: "before:[mask-image:url(/assets/svg/tablar-icons/search.svg)]",
  settings: "before:[mask-image:url(/assets/svg/tablar-icons/settings.svg)]",
  "square-check": "before:[mask-image:url(/assets/svg/tablar-icons/square-check.svg)]",
  square: "before:[mask-image:url(/assets/svg/tablar-icons/square.svg)]",
  "circle-x": "before:[mask-image:url(/assets/svg/tablar-icons/circle-x.svg)]",
  "circle-check": "before:[mask-image:url(/assets/svg/tablar-icons/circle-check.svg)]",
  x: "before:[mask-image:url(/assets/svg/tablar-icons/x.svg)]",
  plus: "before:[mask-image:url(/assets/svg/tablar-icons/plus.svg)]",
  "arrow-back": "before:[mask-image:url(/assets/svg/tablar-icons/arrow-back.svg)]",
} as const;
type Icons = keyof typeof Icons;

const Colors = {
  primary(active: boolean) {
    return {
      ...classes("before:bg-darkgray"),
      ...(active
        ? classes("before:bg-primary-300")
        : classes("before:hover:bg-primary-300", "before:active:bg-primary-500")),
    };
  },
  secondary1(active: boolean) {
    return {
      ...classes("before:bg-darkgray"),
      ...(active
        ? classes("before:bg-secondary1-200")
        : classes("before:hover:bg-secondary1-200", "before:active:bg-secondary1-500")),
    };
  },
  secondary2(active: boolean) {
    return {
      ...classes("before:bg-darkgray"),
      ...(active
        ? classes("before:bg-secondary2-200")
        : classes("before:hover:bg-secondary2-200", "before:active:bg-secondary2-500")),
    };
  },
  complement(active: boolean) {
    return {
      ...classes("before:bg-darkgray"),
      ...(active
        ? classes("before:bg-complement-200")
        : classes("before:hover:bg-complement-200", "before:active:bg-complement-500")),
    };
  },
  gray(active: boolean) {
    return {
      ...classes("before:bg-gray"),
      ...(active ? classes("bg-darkgray") : classes("before:hover:bg-darkgray", "before:active:bg-black")),
    };
  },
};

const Styles = {
  type: (type: Icons) => {
    return classes(
      Icons[type],
      "before:[mask-size:cover]",
      "before:[mask-repeat:no-repeat]",
      "before:[mask-position:center]",
    );
  },

  iconBase: classes(
    "transition-colors",
    "bg-none",
    "flex",
    "items-center",
    "justify-center",
    "rounded",
    "before:inline-block",
    "before:transition-colors",
  ),

  size: (size: IconSize) => {
    switch (size) {
      case "l":
        return classes("w-7", "h-7", "before:w-7", "before:h-7");
      case "m":
        return classes("w-6", "h-6", "before:w-6", "before:h-6");
      case "s":
        return classes("w-5", "h-5", "before:w-5", "before:h-5");
    }
  },

  color: (color: Color, disabled: boolean, active: boolean) => {
    return disabled ? classes("before:bg-lightgray") : Colors[color](active);
  },
};

// eslint-disable-next-line func-style
export function Icon({ size, type, color, disabled, active, testid, style }: Props) {
  const iconClass = {
    ...Styles.iconBase,
    ...Styles.size(size ?? "s"),
    ...Styles.type(type),
    ...Styles.color(color ?? "primary", disabled ?? false, active ?? false),
    ...style,
  };

  return (
    <span
      className={classNames(iconClass)}
      aria-disabled={disabled}
      data-active={active ?? false}
      data-testid={testid ?? "icon"}
    ></span>
  );
}
