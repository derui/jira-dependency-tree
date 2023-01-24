import React, { PropsWithChildren, useEffect, useRef } from "react";
import classNames from "classnames";
import { createPortal } from "react-dom";
import { BaseProps, classes, generateTestId } from "../helper";
import { Rect } from "@/util/basic";

type Alignment = "bottomLeft" | "bottomRight";
type Margin = "all" | "left" | "left-top" | "top" | "right-top" | "right" | "none";

export interface Props extends BaseProps, PropsWithChildren {
  readonly aligned: Alignment;
  readonly opened: boolean;
  readonly parentRect?: Rect;
  readonly selector?: string;
  readonly margin?: Margin;
}

const Styles = {
  dialog: (opened: boolean, aligned: Alignment, margin: Margin) => {
    return {
      ...classes(
        "z-50",
        "bg-white",
        "absolute",
        "top-full",
        "rounded",
        "shadow-lg",
        "transition-width",
        "overflow-hidden",
      ),
      "w-0": !opened,
      "w-96": opened,
      "left-0": aligned === "bottomLeft",
      "right-0": aligned === "bottomRight",
      ...(margin === "all" ? classes("m-3") : {}),
      ...(margin === "top" ? classes("mt-3") : {}),
      ...(margin === "left" ? classes("ml-3") : {}),
      ...(margin === "left-top" ? classes("mt-3", "ml-3") : {}),
      ...(margin === "right-top" ? classes("mt-3", "mr-3") : {}),
      ...(margin === "right" ? classes("mr-3") : {}),
    };
  },
};

const getPositionalStyle = (props: Props) => {
  if (!props.parentRect) {
    return {};
  }

  switch (props.aligned) {
    case "bottomLeft":
      return { top: `calc(${props.parentRect.top + props.parentRect.height}px)`, left: `${props.parentRect.left}px` };
    case "bottomRight":
      return {
        top: `calc(${props.parentRect.top + props.parentRect.height}px)`,
        left: `calc(${props.parentRect.right} - 100%`,
      };
  }
};

export const Dialog: React.FC<Props> = (props) => {
  const gen = generateTestId(props.testid);
  const ref = useRef(document.createElement("div"));
  const selector = props.selector ?? "#dialog-root";

  useEffect(() => {
    document.querySelector(selector)?.appendChild(ref.current);

    return () => {
      document.querySelector(selector)?.removeChild(ref.current);
    };
  }, []);

  const style = getPositionalStyle(props);

  const container = (
    <div
      className={classNames(Styles.dialog(props.opened, props.aligned, props.margin ?? "none"))}
      aria-hidden={!props.opened}
      style={style}
      data-testid={gen("dialog")}
    >
      {props.children}
    </div>
  );
  return createPortal(container, ref.current);
};
