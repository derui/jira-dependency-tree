import classNames from "classnames";

type IconSize = "s" | "m" | "l";

type Color = "primary" | "secondary1" | "gray" | "secondary2" | "complement";

const Icons = {
  "chevron-down": "before:[mask-image:url(/assets/svg/tabler-icons/chevron-down.svg)]",
  "door-exit": "before:[mask-image:url(/assets/svg/tabler-icons/door-exit.svg)]",
  "layout-2": "before:[mask-image:url(/assets/svg/tabler-icons/layout-2.svg)]",
  "layout-distribute-horizontal": "before:[mask-image:url(/assets/svg/tabler-icons/layout-distribute-horizontal.svg)]",
  "layout-distribute-vertical": "before:[mask-image:url(/assets/svg/tabler-icons/layout-distribute-vertical.svg)]",
  refresh: "before:[mask-image:url(/assets/svg/tabler-icons/refresh.svg)]",
  search: "before:[mask-image:url(/assets/svg/tabler-icons/search.svg)]",
  settings: "before:[mask-image:url(/assets/svg/tabler-icons/settings.svg)]",
  "square-check": "before:[mask-image:url(/assets/svg/tabler-icons/square-check.svg)]",
  square: "before:[mask-image:url(/assets/svg/tabler-icons/square.svg)]",
  "circle-x": "before:[mask-image:url(/assets/svg/tabler-icons/circle-x.svg)]",
  "circle-check": "before:[mask-image:url(/assets/svg/tabler-icons/circle-check.svg)]",
  x: "before:[mask-image:url(/assets/svg/tabler-icons/x.svg)]",
  plus: "before:[mask-image:url(/assets/svg/tabler-icons/plus.svg)]",
  "arrow-back": "before:[mask-image:url(/assets/svg/tabler-icons/arrow-back.svg)]",
  pencil: "before:[mask-image:url(/assets/svg/tabler-icons/pencil.svg)]",
} as const;
type Icons = keyof typeof Icons;

const Colors = {
  primary(active: boolean, group?: string) {
    return classNames(
      "before:bg-darkgray",
      {
        "before:bg-primary-300": active,
      },
      {
        "hover:before:bg-primary-300": !active,
        "active:before:bg-primary-500": !active,
      },
      {
        [`${group}-hover:before:bg-primary-300`]: !active && group,
        [`${group}-active:before:bg-primary-500`]: !active && group,
      },
    );
  },
  secondary1(active: boolean, group?: string) {
    return classNames(
      "before:bg-darkgray",
      {
        "before:bg-secondary1-200": active,
      },
      {
        "hover:before:bg-secondary1-200": !active,
        "active:before:bg-secondary1-500": !active,
      },
      {
        [`${group}-hover:before:bg-secondary1-200`]: !active && group,
        [`${group}-active:before:bg-secondary1-500`]: !active && group,
      },
    );
  },
  secondary2(active: boolean, group?: string) {
    return classNames(
      "before:bg-darkgray",
      {
        "before:bg-secondary2-200": active,
      },
      {
        "hover:before:bg-secondary2-200": !active,
        "active:before:bg-secondary2-500": !active,
      },
      {
        [`${group}-hover:before:bg-secondary2-200`]: !active && group,
        [`${group}-active:before:bg-secondary2-500`]: !active && group,
      },
    );
  },
  complement(active: boolean, group?: string) {
    return classNames(
      "before:bg-darkgray",
      {
        "before:bg-complement-200": active,
      },
      {
        "hover:before:bg-complement-200": !active,
        "active:before:bg-complement-500": !active,
      },
      {
        [`${group}-hover:before:bg-complement-200`]: !active && group,
        [`${group}-active:before:bg-complement-500`]: !active && group,
      },
    );
  },
  gray(active: boolean, group?: string) {
    return classNames(
      "before:bg-gray",
      {
        "bg-darkgray": active,
      },
      {
        "hover:before:bg-darkgray": !active,
        "active:before:bg-black": !active,
      },
      {
        [`${group}-hover:before:bg-darkgray`]: !active && group,
        [`${group}-active:before:bg-black`]: !active && group,
      },
    );
  },
};

const Styles = {
  type: (type: Icons) => {
    return classNames(
      Icons[type],
      "before:[mask-size:cover]",
      "before:[mask-repeat:no-repeat]",
      "before:[mask-position:center]",
    );
  },

  iconBase: classNames(
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
        return classNames("w-7", "h-7", "before:w-7", "before:h-7");
      case "m":
        return classNames("w-6", "h-6", "before:w-6", "before:h-6");
      case "s":
        return classNames("w-5", "h-5", "before:w-5", "before:h-5");
    }
  },

  color: (color: Color, disabled: boolean, active: boolean, group?: string) => {
    return disabled ? classNames("before:bg-lightgray") : Colors[color](active, group);
  },
};

export interface IconizeConfig {
  size?: IconSize;
  type: Icons;
  color?: Color;
  style?: Record<string, boolean>;
  disabled?: boolean;
  active?: boolean;
  group?: string;
}

/**
 * get class name list to iconize an element
 */
export const iconize = function iconize(config: IconizeConfig) {
  return classNames(
    Styles.iconBase,
    Styles.type(config.type),
    Styles.size(config.size ?? "s"),
    Styles.color(config.color ?? "primary", config.disabled ?? false, config.active ?? false, config.group),
  );
};
