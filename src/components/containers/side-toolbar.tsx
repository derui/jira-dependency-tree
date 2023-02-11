import type React from "react";
import classNames from "classnames";
import { BaseProps, classes, generateTestId } from "../helper";
import { IssueGraphLayouter } from "../organisms/issue-graph-layouter";
import { GraphUnroller } from "../organisms/graph-unroller";

export type Props = BaseProps;

const Styles = {
  root: classes(
    "absolute",
    "flex",
    "flex-col",
    "left-4",
    "top-half",
    "bg-white",
    "rounded",
    "list-none",
    "top-1/2",
    "shadow-md",
    "z-10",
    "p-1",
  ),
  divider: classes("mx-1", "border-t", "border-t-lightgray"),
};

export const SideToolbar: React.FC<Props> = (props) => {
  const gen = generateTestId(props.testid);

  return (
    <ul className={classNames(Styles.root)}>
      <IssueGraphLayouter testid={gen("graph-layouter")} />
      <span className={classNames(Styles.divider)} />
      <GraphUnroller testid={gen("graph-unroller")} />
    </ul>
  );
};
