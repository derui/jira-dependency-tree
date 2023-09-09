import { PropsWithChildren, useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { createPortal } from "react-dom";
import { BaseProps, generateTestId } from "../helper";
import { Rect } from "@/utils/basic";

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
    margin,
    initialized,
  }: {
    opened: boolean;
    margin: Margin;
    initialized: InitializationStep;
  }) => {
    const base = [
      "z-50",
      "bg-white",
      "absolute",
      "top-full",
      "rounded",
      "shadow-lg",
      "transition-width",
      "overflow-hidden",
    ];

    if (initialized !== "Recorded") {
      return classNames(base, "w-96", "left-[-9999px]");
    }

    return classNames(base, {
      invisible: !opened,
      "w-0": !opened,
      "w-96": opened,
      "m-3": margin === "all",
      "mt-3": margin === "top" || margin === "left-top" || margin === "right-top",
      "ml-3": margin === "left" || margin === "left-top",
      "mr-3": margin === "right" || margin === "right-top",
    });
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
        right: `-${props.parentRect.right}px`,
      };
  }
};

// eslint-disable-next-line func-style
export function Dialog(props: Props) {
  const gen = generateTestId(props.testid);
  const [initialized, setInitialized] = useState<InitializationStep>("YetMount");
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
      setInitialized("Recorded");
    }
  }, [initialized]);

  const style = getPositionalStyle(props);

  const container = (
    <div
      ref={rootRef}
      className={classNames(
        Styles.dialog({
          initialized,
          opened: props.opened,
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
}
