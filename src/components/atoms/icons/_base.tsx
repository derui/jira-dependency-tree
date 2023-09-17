import classNames from "classnames";
import { Color, IconSize, IconType } from "./type";
import { BaseProps } from "@/components/helper";

export interface BaseIconProps extends BaseProps {
  readonly iconType: IconType;
  readonly color?: Color;
  readonly size?: IconSize;
}

const Colors = {
  primary() {
    return classNames("before:bg-primary-400");
  },
  secondary1() {
    return classNames("before:bg-secondary1-400");
  },
  secondary2() {
    return classNames("before:bg-secondary2-400");
  },
  complement() {
    return classNames("before:bg-complement-400");
  },
  gray() {
    return classNames("before:bg-gray");
  },
};

const Styles = {
  type: (type: IconType) => {
    return classNames(
      IconType[type],
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
} as const;

export const Icon = function Icon(props: BaseIconProps) {
  const { iconType, color = "gray", size = "m" } = props;

  const className = classNames(Styles.iconBase, Colors[color](), Styles.size(size), Styles.type(iconType));

  return <span className={className}></span>;
};
