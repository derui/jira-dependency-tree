import React, { PropsWithChildren } from "react";
import classNames from "classnames";
import { BaseProps, classes, generateTestId } from "../helper";

type ColorSchema = "primary" | "secondary1" | "gray";

export interface Props extends PropsWithChildren, BaseProps {
  schema: ColorSchema;
  type?: "normal" | "submit";
  disabled?: boolean;
  onClick: () => void;
}

const Styles = {
  button: classes(
    "flex-none",
    "self-end",
    "px-3",
    "py-2",
    "rounded",
    "transition-colors",
    "border",
    "disabled:color-gray",
    "disabled:bg-lightgray",
    "disabled:border-gray",
  ),

  color: (schema: ColorSchema) => {
    switch (schema) {
      case "secondary1":
        return classes(
          "border-secondary1-100",
          "bg-secondary1-200",
          "color-white",
          "hover:bg-secondary1-300",
          "active:bg-secondary1-400",
        );
      case "primary":
        return classes(
          "border-primary-100",
          "bg-primary-200",
          "color-white",
          "hover:bg-primary-300",
          "active:bg-primary-400",
        );
      case "gray":
        return classes("border-gray", "bg-white", "color-black", "hover:bg-lightgray", "active:bg-gray");
    }
  },
};

export const Button: React.FC<Props> = (props) => {
  const gen = generateTestId(props.testid);

  const classes = classNames({
    ...Styles.button,
    ...Styles.color(props.schema),
  });

  if (props.type === "submit") {
    return (
      <button
        className={classes}
        type='submit'
        aria-disabled={props.disabled}
        data-testid={gen("button")}
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
        aria-disabled={props.disabled}
        data-testid={gen("button")}
        onClick={props.onClick}
      >
        {props.children}
      </button>
    );
  }
};
