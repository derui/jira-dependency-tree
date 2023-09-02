import type React from "react";
import classNames from "classnames";
import { BaseProps, generateTestId } from "../helper";
import { iconize } from "../atoms/iconize";

export interface Props extends BaseProps {
  draft?: boolean;
  onClick?: () => void;
}

const Styles = {
  root: classNames("flex", "relative", "h-16", "w-4", "group", "my-2"),

  defaultArrowStyle: classNames(
    "relative",
    "mb-4",
    "h-full",
    // definition arrow
    "before:absolute",
    "before:pointer-events-none",
    "before:top-[100%]",
    "before:left-[50%]",
    "before:border-transparent",
    "after:absolute",
    "after:pointer-events-none",
    "after:top-[100%]",
    "after:left-[50%]",
    "after:border-transparent",
  ),

  draft: () =>
    classNames(
      Styles.defaultArrowStyle,
      "w-0",
      "border-x-2",
      "border-dashed",
      "border-primary-300",
      // definition arrow background
      "before:inline-block",
      "before:w-0",
      "before:h-0",
      "before:border-t-primary-300",
      "before:border-[1rem]",
      "before:-ml-4",
      "before:-mt-3",
    ),
  normal: () =>
    classNames(
      Styles.defaultArrowStyle,
      "w-2",
      "border-x-2",
      "border-secondary2-200",
      "bg-secondary2-200",
      // definition arrow background
      "before:border-transparent",
      "after:border-transparent",
      "before:border-t-secondary2-200",
      "before:border-[1rem]",
      "before:-ml-4",
      "before:-mt-3",
    ),

  deleter: classNames(
    "absolute",
    "rounded-full",
    "w-6",
    "h-6",
    "border",
    "border-primary-300",
    "bg-white",
    "top-1/3",
    "-left-1/2",
    iconize({ type: "x", size: "s", color: "primary", active: true }),
    "opacity-0",
    "cursor-pointer",
    "group-hover:opacity-100",
    "transition-opacity",
  ),
};

// eslint-disable-next-line func-style
export function RelationArrow(props: Props) {
  const gen = generateTestId(props.testid);

  const handleClick = (e: React.MouseEvent) => {
    if (!props.onClick) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    props.onClick();
  };

  const Deleter = props.onClick ? <span className={Styles.deleter} onClick={handleClick} /> : null;

  return (
    <li className={Styles.root} data-testid={gen("root")}>
      <span className={props.draft ? Styles.draft() : Styles.normal()} />
      {Deleter}
    </li>
  );
}
