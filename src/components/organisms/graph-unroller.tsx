import type React from "react";
import classNames from "classnames";
import { BaseProps, generateTestId } from "../helper";
import { ArrowBack } from "../atoms/icons";
import { useGraphUnroll } from "@/hooks/graph-unroll";

export type Props = BaseProps;

const Styles = {
  unroller: () =>
    classNames(
      "flex",
      "relative",
      "flex-none",
      "bg-white",
      "transition-colors",
      "cursor-pointer",
      "p-2",
      "w-10",
      "h-10",
    ),
};

// eslint-disable-next-line func-style
export function GraphUnroller(props: Props) {
  const gen = generateTestId(props.testid);
  const { active, narrow } = useGraphUnroll();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    narrow();
  };

  return (
    <li
      className={Styles.unroller()}
      data-testid={gen("unroller")}
      onClick={handleClick}
      aria-disabled={!active}
      data-active={active}
    >
      <ArrowBack color={!active ? "gray" : "secondary1"} />
    </li>
  );
}
