import { PropsWithChildren } from "react";
import classNames from "classnames";
import { BaseProps } from "../helper";
import { ColorSchema } from "../type";

export interface Props extends PropsWithChildren, BaseProps {
  color: ColorSchema;
  type?: "normal" | "submit";
  size?: "l" | "m" | "s";
  disabled?: boolean;
  onClick?: () => void;
}

const colors: Record<ColorSchema, string> = {
  gray: classNames("border-gray", "bg-white", "text-black", "hover:bg-lightgray/50", "active:bg-gray/50"),
  primary: classNames("hover:bg-primary-200/60", "active:bg-primary-200"),
  secondary1: classNames("hover:bg-secondary1-200/60", "active:bg-secondary1-200"),

  secondary2: classNames("hover:bg-secondary2-200/60", "active:bg-secondary2-200"),
  complement: classNames("hover:bg-complement-200/60", "active:bg-complement-200"),
} as const;

const Styles = {
  button: classNames(
    "flex-none",
    "p-1",
    "flex",
    "justify-center",
    "items-center",
    "rounded-full",
    "transition-colors",
    "disabled:text-gray",
    "disabled:bg-lightgray/30",
    "disabled:border-gray",
  ),

  width: (size: Props["size"]) => {
    return classNames({
      "w-9": size === "l",
      "w-8": size === "m",
      "w-7": size === "s",
    });
  },

  color: (schema: ColorSchema) => colors[schema],
};

// eslint-disable-next-line func-style
export function IconButton(props: Props) {
  const classes = classNames(Styles.button, Styles.color(props.color), Styles.width(props.size));

  const handleClick = (e: React.MouseEvent) => {
    if (props.type != "submit") {
      e.preventDefault();
    }
    e.stopPropagation();

    if (props.onClick) {
      props.onClick();
    }
  };

  const type = props.type === "submit" ? "submit" : "button";
  return (
    <button
      className={classes}
      type={type}
      disabled={props.disabled ?? false}
      aria-disabled={props.disabled ?? false}
      data-testid={props.testid ?? "button"}
      onClick={handleClick}
    >
      {props.children}
    </button>
  );
}
