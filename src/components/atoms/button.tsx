import { PropsWithChildren } from "react";
import classNames from "classnames";
import { BaseProps } from "../helper";

type ColorSchema = "primary" | "gray";

export interface Props extends PropsWithChildren, BaseProps {
  schema: ColorSchema;
  type?: "normal" | "submit";
  size?: "full" | "l" | "m" | "s";
  disabled?: boolean;
  onClick?: () => void;
}

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

  color: (schema: ColorSchema) => {
    return classNames(
      {
        "border-secondary2-300": schema === "primary",
        "bg-secondary2-200/60": schema === "primary",
        "text-secondary1-400": schema === "primary",
        "hover:bg-secondary2-200": schema === "primary",
        "active:bg-secondary2-300": schema === "primary",
      },
      {
        "border-gray": schema === "gray",
        "bg-white": schema === "gray",
        "text-black": schema === "gray",
        "hover:bg-lightgray/50": schema === "gray",
        "active:bg-gray/50": schema === "gray",
      },
    );
  },
};

// eslint-disable-next-line func-style
export function Button(props: Props) {
  const classes = classNames(Styles.button, Styles.color(props.schema), Styles.width(props.size));

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
}
