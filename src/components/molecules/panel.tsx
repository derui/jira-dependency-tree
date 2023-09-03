import classNames from "classnames";
import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { iconize } from "../atoms/iconize";
import { Button } from "../atoms/button";
import { BaseProps, generateTestId } from "../helper";

export interface Props extends BaseProps, React.PropsWithChildren {
  selector?: string;
  opened?: boolean;
  onClose?: () => void;
  title?: string;
}

const Styles = {
  root: (opened?: boolean) => {
    return classNames(
      "z-10",
      "absolute",
      "top-0",
      "right-0",
      "bg-white",
      "z-10",
      "h-full",
      "shadow-lg",
      "transition-width",
      "flex",
      "flex-col",
      "grid-rows-3",
      "grid-cols-1",
      "overflow-hidden",
      {
        "w-0": !opened,
        "w-96": opened,
      },
    );
  },
  header: classNames(
    "w-full",
    "h-16",
    "px-2",
    "relative",
    "flex-none",
    "flex",
    "flex-row",
    "items-center",
    "text-secondary1-500",
    "justify-between",
    "border-b",
    "border-b-secondary2-400",
  ),
  headerText: classNames("text-xl", "h-full", "items-center", "flex"),
  headerKey: classNames("text-base"),
  headerButtonContainer: classNames("flex", "top-3", "right-2"),
  main: classNames("flex", "flex-col", "overflow-hidden", "h-full"),
};

// eslint-disable-next-line func-style
export function Panel(props: Props) {
  const gen = generateTestId(props.testid);
  const { opened, onClose } = props;
  const ref = useRef(document.createElement("div"));

  const selector = props.selector ?? "#panel-root";

  useEffect(() => {
    document.querySelector(selector)?.appendChild(ref.current);

    return () => {
      document.querySelector(selector)?.removeChild(ref.current);
    };
  }, []);

  const handleClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const container = (
    <div className={classNames(Styles.root(opened))} aria-hidden={!opened} data-testid={gen("root")}>
      <header className={classNames(Styles.header)} data-testid={gen("header")}>
        <h4 className={classNames(Styles.headerText)}>{props.title}</h4>
        <span className={classNames(Styles.headerButtonContainer)}>
          <Button size="s" onClick={handleClick} testid={gen("close")} schema="gray">
            <span className={iconize({ type: "x", size: "s", color: "gray" })}></span>
          </Button>
        </span>
      </header>
      <main className={classNames(Styles.main)}>{props.children}</main>
    </div>
  );

  return createPortal(container, ref.current);
}
