import { PropsWithChildren, RefObject, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import classNames from "classnames";
import { TooltipPosition, TooltipPositionType } from "./type";
import { calculatePosition } from "./_calculate-position";
import { BaseProps, generateTestId } from "@/components/helper";

interface Props extends BaseProps {
  /**
   * An element to snap tooltip
   */
  target: RefObject<Element>;

  /**
   * The position of tooltip. Default is `top`
   */
  position?: TooltipPositionType;
}

const Styles = {
  root: ({ display, position }: TooltipPosition) =>
    classNames("absolute", "transition-[transform,opacity]", {
      "-left-[99999px]": !display,
      "scale-90": !display,
      "opacity-50": !display,
      "opacity-100": display,
      "scale-100": display,
      [`left-[${position?.x ?? 0}px]`]: display,
      [`top-[${position?.y ?? 0}px]`]: display,
    }),
  content: classNames(
    "max-w-sm",
    "flex",
    "items-center",
    "justify-center",
    "px-3",
    "py-2",
    "whitespace-wrap",
    "rounded",
    "shadow-md",
    "bg-darkgray",
    "text-white",
    "text-sm",
  ),
} as const;

// eslint-disable-next-line func-style
export function TooltipBody(props: PropsWithChildren<Props>) {
  const gen = generateTestId(props.testid);
  const { position = "top", target, children } = props;
  const rootElement = useRef(document.createElement("div"));
  const [hover, setHover] = useState(false);
  const tooltipPosition = useMemo<TooltipPosition>(() => {
    if (target.current) {
      return {
        display: hover,
        type: position,
        position: hover ? calculatePosition(position, target.current, rootElement.current) : undefined,
      };
    } else {
      return { display: false, type: position };
    }
  }, [target.current, rootElement.current, hover, position]);

  useEffect(() => {
    rootElement.current.className = Styles.root(tooltipPosition);

    const child = document.body.appendChild(rootElement.current);

    return () => {
      document.body.removeChild(child);
    };
  }, []);

  useEffect(() => {
    rootElement.current.className = Styles.root(tooltipPosition);
  }, [tooltipPosition]);

  useEffect(() => {
    if (!target.current) {
      return;
    }
    const current = target.current;

    const enterListener = () => {
      setHover(true);
    };

    const leaveListener = () => {
      setHover(false);
    };

    current.addEventListener("mouseenter", enterListener);
    current.addEventListener("mouseleave", leaveListener);

    return () => {
      current.removeEventListener("mouseenter", enterListener);
      current.removeEventListener("mouseleave", leaveListener);
    };
  }, [target.current]);

  return createPortal(
    <div className={Styles.content} data-testid={gen("tooltip")}>
      {children}
    </div>,
    rootElement.current,
  );
}
