import type React from "react";
import classNames from "classnames";
import { BaseProps, generateTestId } from "../helper";
import { iconize } from "../atoms/iconize";
import { useGraphUnroll } from "@/hooks/graph-unroll";

export type Props = BaseProps;

const Styles = {
  unroller: (active: boolean) =>
    classNames(
      "relative",
      "flex-none",
      "bg-white",
      "transition-colors",
      "cursor-pointer",
      "p-2",
      "w-10",
      "h-10",
      iconize({ type: "arrow-back", color: "secondary1", active, disabled: !active }),
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
      className={Styles.unroller(active)}
      data-testid={gen("unroller")}
      onClick={handleClick}
      aria-disabled={!active}
      data-active={active}
    ></li>
  );
}
