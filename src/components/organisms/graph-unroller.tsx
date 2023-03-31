import type React from "react";
import classNames from "classnames";
import { BaseProps, generateTestId } from "../helper";
import { useAppDispatch, useAppSelector } from "../hooks";
import { iconize } from "../atoms/iconize";
import { selectProjectionTargetIssue } from "@/state/selectors/issues";
import { narrowExpandedIssue } from "@/state/actions";

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
  const projectionTarget = useAppSelector(selectProjectionTargetIssue());
  const dispatch = useAppDispatch();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (projectionTarget) {
      dispatch(narrowExpandedIssue());
    }
  };
  const active = projectionTarget !== undefined;

  return (
    <li
      className={Styles.unroller(active)}
      data-testid={gen("unroller")}
      onClick={handleClick}
      data-active={active}
    ></li>
  );
}
