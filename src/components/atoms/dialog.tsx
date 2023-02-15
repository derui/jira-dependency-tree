import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
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

type InitializationStep = "YetMount" | "Mounted" | "Recorded";

const Styles = {
  dialog: ({
    opened,
    aligned,
    margin,
    initialized,
  }: {
    opened: boolean;
    aligned: Alignment;
    margin: Margin;
    initialized: InitializationStep;
  }) => {
    const base = classes(
      "z-50",
      "bg-white",
      "absolute",
      "top-full",
      "rounded",
      "shadow-lg",
      "transition-width",
      "overflow-hidden",
    );

    if (initialized !== "Recorded") {
      return {
        ...base,
        ...classes("w-96", "left-[-9999px]"),
      };
    }

    return {
      ...base,
      invisible: !opened,
      "w-0": !opened,
      "w-96": opened,
      "right-3": aligned === "bottomRight",
      ...(margin === "all" ? classes("m-3") : {}),
      ...(margin === "top" ? classes("mt-3") : {}),
      ...(margin === "left" ? classes("ml-3") : {}),
      ...(margin === "left-top" ? classes("mt-3", "ml-3") : {}),
      ...(margin === "right-top" ? classes("mt-3", "mr-3") : {}),
      ...(margin === "right" ? classes("mr-3") : {}),
    };
  },
};

const getPositionalStyle = (props: Props, rootRect: Rect) => {
  if (!props.parentRect) {
    return {};
  }

  switch (props.aligned) {
    case "bottomLeft":
      return { top: `calc(${props.parentRect.top + props.parentRect.height}px)`, left: `${props.parentRect.left}px` };
    case "bottomRight":
      return {
        top: `calc(${props.parentRect.top + props.parentRect.height}px)`,
        left: `calc(${props.parentRect.left}px + ${props.parentRect.width - rootRect.width}px)`,
      };
  }
};

export const Dialog: React.FC<Props> = (props) => {
  const gen = generateTestId(props.testid);
  const [initialized, setInitialized] = useState<InitializationStep>("YetMount");
  const [rect, setRect] = useState(Rect.empty());
  const ref = useRef(document.createElement("div"));
  const rootRef = useRef<HTMLDivElement | null>(null);
  const selector = props.selector ?? "#dialog-root";

  useEffect(() => {
    document.querySelector(selector)?.appendChild(ref.current);

    setInitialized("Mounted");

    return () => {
      document.querySelector(selector)?.removeChild(ref.current);
      setInitialized("YetMount");
    };
  }, []);

  useEffect(() => {
    if (initialized === "Mounted" && rootRef.current) {
      setRect(Rect.fromDOMRect(rootRef.current.getBoundingClientRect()));
      setInitialized("Recorded");
    }
  }, [initialized]);

  const style = getPositionalStyle(props, rect);

  const container = (
    <div
      ref={rootRef}
      className={classNames(
        Styles.dialog({
          initialized,
          opened: props.opened,
          aligned: props.aligned,
          margin: props.margin ?? "none",
        }),
      )}
      aria-hidden={!props.opened}
      style={style}
      data-testid={gen("dialog")}
    >
      {props.children}
    </div>
  );
  return createPortal(container, ref.current);
};
