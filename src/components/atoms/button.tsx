import React, { PropsWithChildren } from "react";
import classNames from "classnames";
import { BaseProps, classes } from "../helper";

type ColorSchema = "primary" | "gray";

export interface Props extends PropsWithChildren, BaseProps {
  schema: ColorSchema;
  type?: "normal" | "submit";
  size?: "full" | "l" | "m" | "s";
  disabled?: boolean;
  onClick?: () => void;
}

const Styles = {
  button: classes(
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
    "disabled:color-gray",
    "disabled:bg-lightgray",
    "disabled:border-gray",
  ),

  width: (size: Props["size"]) => {
    switch (size) {
      case "full":
        return classes("w-full");
      case "l":
        return classes("w-40");
      case "s":
        return classes("w-12");
      case "m":
      default:
        return classes("w-20");
    }
  },

  color: (schema: ColorSchema) => {
    switch (schema) {
      case "primary":
        return classes(
          "border-secondary2-300",
          "bg-secondary2-200/60",
          "text-secondary1-400",
          "hover:bg-secondary2-200",
          "active:bg-secondary2-300",
        );
      case "gray":
        return classes("border-gray", "bg-white", "text-black", "hover:bg-lightgray/50", "active:bg-gray/50");
    }
  },
};

export const Button: React.FC<Props> = (props) => {
  const classes = classNames({
    ...Styles.button,
    ...Styles.color(props.schema),
    ...Styles.width(props.size),
  });

  if (props.type === "submit") {
    return (
      <button
        className={classes}
        type='submit'
        aria-disabled={props.disabled ?? false}
        data-testid={props.testid ?? "button"}
        onClick={props.onClick}
      >
        {props.children}
      </button>
    );
  } else {
    return (
      <button
        className={classes}
        type='button'
        aria-disabled={props.disabled ?? false}
        data-testid={props.testid ?? "button"}
        onClick={props.onClick}
      >
        {props.children}
      </button>
    );
  }
};
