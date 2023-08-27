import { PropsWithChildren } from "react";
import classNames from "classnames";
import { BaseProps } from "../helper";

type ColorSchema = "primary" | "gray" | "secondary1" | "secondary2";

export interface Props extends PropsWithChildren, BaseProps {
  schema: ColorSchema;
  type?: "normal" | "submit";
  size?: "full" | "l" | "m" | "s";
  disabled?: boolean;
  onClick?: () => void;
}

const ColorSchema: Record<ColorSchema, string> = {
  gray: classNames("border-gray", "bg-white", "text-black", "hover:bg-lightgray/50", "active:bg-gray/50"),
  primary: classNames(
    "border-primary-300",
    "bg-primary-200/60",
    "text-primary-400",
    "hover:bg-primary-200",
    "active:bg-primary-300",
  ),
  secondary1: classNames(
    "border-secondary1-300",
    "bg-secondary1-200/40",
    "text-secondary1-400",
    "hover:bg-secondary1-200/60",
    "active:bg-secondary1-300/80",
  ),

  secondary2: classNames(
    "border-secondary2-300",
    "bg-secondary2-200",
    "text-secondary2-400",
    "hover:bg-secondary2-200",
    "active:bg-secondary2-300",
  ),
} as const;

const Styles = {
  button: classNames(
    "flex-none",
    "self-end",
    "px-3",
    "py-2",
    "flex",
    "justify-center",
    "items-center",
    "rounded",
    "transition-colors",
    "border",
    "whitespace-nowrap",
    "overflow-hidden",
    "text-ellipsis",
    "disabled:text-gray",
    "disabled:bg-lightgray",
    "disabled:border-gray",
  ),

  width: (size: Props["size"]) => {
    return classNames({
      "w-full": size === "full",
      "w-40": size === "l",
      "w-12": size === "s",
      "w-20": size === "m",
    });
  },

  color: (schema: ColorSchema) => ColorSchema[schema],
};

// eslint-disable-next-line func-style
export function Button(props: Props) {
  const classes = classNames(Styles.button, Styles.color(props.schema), Styles.width(props.size));

  const type = props.type === "submit" ? "submit" : "button";
  return (
    <button
      className={classes}
      type={type}
      disabled={props.disabled ?? false}
      aria-disabled={props.disabled ?? false}
      data-testid={props.testid ?? "button"}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}
