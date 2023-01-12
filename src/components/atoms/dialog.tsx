import React, { PropsWithChildren, useEffect, useRef } from "react";
import classNames from "classnames";
import { createPortal } from "react-dom";
import { BaseProps, classes, generateTestId } from "../helper";
import { Rect } from "@/util/basic";

type Alignment = "bottomLeft" | "bottomRight";

export interface Props extends BaseProps, PropsWithChildren {
  readonly aligned: Alignment;
  readonly opened: boolean;
  readonly parentRect?: Rect;
  readonly selector?: string;
}

const Styles = {
  dialog: (opened: boolean, aligned: Alignment) => {
    return {
      ...classes(
        "bg-white",
        "absolute",
        "top-full",
        "right-0",
        "mt-2",
        "right-3",
        "rounded",
        "shadow-lg",
        "transition-width",
        "overflow-hidden",
      ),
      ...(!opened ? classes("w-0") : classes("w-96")),
      ...(aligned === "bottomLeft" ? classes("left-0") : {}),
      ...(aligned === "bottomRight" ? classes("right-0") : {}),
    };
  },
};

const getPositionalStyle = (props: Props) => {
  if (!props.parentRect) {
    return {};
  }

  switch (props.aligned) {
    case "bottomLeft":
      return { top: `calc(${props.parentRect.top + props.parentRect.height}px)` };
    case "bottomRight":
      return { top: `calc(${props.parentRect.top + props.parentRect.height}px)` };
  }
};

export const Dialog: React.FC<Props> = (props) => {
  const gen = generateTestId(props.testid);
  const ref = useRef(document.createElement("div"));
  const selector = props.selector ?? "#modal-root";

  useEffect(() => {
    document.querySelector(selector)?.appendChild(ref.current);

    return () => {
      document.querySelector(selector)?.removeChild(ref.current);
    };
  }, []);

  const style = getPositionalStyle(props);

  const container = (
    <div className={classNames(Styles.dialog(props.opened, props.aligned))} style={style} data-testid={gen("dialog")}>
      {props.children}
    </div>
  );
  return createPortal(container, ref.current);
};
