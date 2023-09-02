import classNames from "classnames";
import { BaseProps, generateTestId } from "../helper";
import { IssueGraphLayouter } from "../organisms/issue-graph-layouter";
import { GraphUnroller } from "../organisms/graph-unroller";

export type Props = BaseProps;

const Styles = {
  root: classNames(
    "absolute",
    "flex",
    "flex-col",
    "left-4",
    "top-1/2",
    "bg-white",
    "rounded",
    "list-none",
    "top-1/2",
    "shadow-md",
    "z-10",
    "p-1",
  ),
  divider: classNames("mx-1", "border-t", "border-t-lightgray"),
};

// eslint-disable-next-line func-style
export function SideToolbar(props: Props) {
  const gen = generateTestId(props.testid);

  return (
    <ul className={Styles.root}>
      <IssueGraphLayouter testid={gen("graph-layouter")} />
      <span className={Styles.divider} />
      <GraphUnroller testid={gen("graph-unroller")} />
    </ul>
  );
}
