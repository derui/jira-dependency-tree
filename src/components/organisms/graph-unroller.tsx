import type React from "react";
import classNames from "classnames";
import { Icon } from "../atoms/icon";
import { BaseProps, classes, generateTestId } from "../helper";
import { useAppDispatch, useAppSelector } from "../hooks";
import { selectProjectionTargetIssue } from "@/state/selectors/issues";
import { narrowExpandedIssue } from "@/state/actions";

export type Props = BaseProps;

const Styles = {
  root: classes(
    "absolute",
    "flex",
    "left-4",
    "top-half",
    "bg-white",
    "rounded",
    "list-none",
    "top-1/2",
    "shadow-md",
    "z-10",
  ),
  unroller: classes("relative", "flex-none", "bg-white", "transition-colors", "cursor-pointer", "p-3", "rounded"),
};

export const GraphUnroller: React.FC<Props> = (props) => {
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

  return (
    <li className={classNames(Styles.unroller)} data-testid={gen("unroller")} onClick={handleClick}>
      <Icon
        type='arrow-back'
        size='m'
        color='secondary1'
        active={projectionTarget !== undefined}
        testid={gen("icon")}
      ></Icon>
    </li>
  );
};
