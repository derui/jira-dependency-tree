import { PropsWithChildren, useEffect, useRef } from "react";
import classNames from "classnames";
import { createPortal } from "react-dom";
import { BaseProps, generateTestId } from "../helper";
import { IconButton } from "./icon-button";
import { X } from "./icons";

type Size = "s" | "m" | "l";

export interface Props extends BaseProps, PropsWithChildren {
  readonly opened: boolean;
  readonly title: string;
  readonly selector?: string;
  readonly size?: Size;
  readonly onClose?: () => void;
}

const Styles = {
  modal: ({
    opened,
    size,
  }: {
    opened: boolean;
    size: Size;
  }) => {
    return classNames(
      "absolute",
      "flex",
      "z-50",
      "bg-white",
      "absolute",
      "rounded-lg",
      "shadow-lg",
      "overflow-hidden",
      "align-stretch",
      "flex-col",
      {
        hidden: !opened,
      },
      {
        "w-80": size == "s",
        "h-64": size == "s",
        "left-[calc(50%_-_20rem_/_2)]": size == "s",
        "top-[calc(50%_-_16rem_/_2)]": size == "s",
        "w-96": size == "m",
        "h-72": size == "m",
        "left-[calc(50%_-_24rem_/_2)]": size == "m",
        "top-[calc(50%_-_18rem_/_2)]": size == "m",

        "w-[32rem]": size == "l",
        "h-[24rem]": size == "l",
        "left-[calc(50%_-_32rem_/_2)]": size == "l",
        "top-[calc(50%_-_24rem_/_2)]": size == "l",
      },
    );
  },

  overlay: (opened: boolean) =>
    classNames("absolute", "left-0", "top-0", "h-full", "w-full", "z-10", "bg-black/20", { hidden: !opened }),
  header: classNames(
    "relative",
    "flex",
    "flex-none",
    "items-center",
    "h-12",
    "py-2",
    "px-3",
    "bg-white",
    "font-bold",
    "shadow-sm",
    "border-b",
    "border-b-gray",
  ),
  main: classNames("flex", "flex-1", "min-h-0", "flex-col"),
  closer: classNames("absolute", "right-2", "top-2"),
};

// eslint-disable-next-line func-style
export function Modal(props: Props) {
  const gen = generateTestId(props.testid);
  const ref = useRef(document.createElement("div"));
  const selector = props.selector ?? "body";
  const { size = "m", title, onClose } = props;

  useEffect(() => {
    document.querySelector(selector)?.appendChild(ref.current);

    return () => {
      document.querySelector(selector)?.removeChild(ref.current);
    };
  }, []);

  const handleClose = () => onClose?.();

  const container = (
    <>
      <div className={Styles.overlay(props.opened)} />
      <div
        className={Styles.modal({ opened: props.opened, size })}
        aria-hidden={!props.opened}
        data-testid={gen("modal")}
      >
        <header className={Styles.header}>
          {title}
          <span className={Styles.closer}>
            <IconButton onClick={handleClose} color="gray" testid={gen("closer")}>
              <X />
            </IconButton>
          </span>
        </header>
        <main className={Styles.main}>{props.children}</main>
      </div>
    </>
  );
  return createPortal(container, ref.current);
}
