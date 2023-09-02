import classNames from "classnames";
import { BaseProps, generateTestId } from "../helper";
import { Issue } from "../molecules/issue";
import { RelationArrow } from "../molecules/relation-arrow";
import { IssueModel } from "@/view-models/issue";

export interface Props extends BaseProps {
  inward?: IssueModel;
}

const Styles = {
  root: classNames("flex", "flex-col", "items-center"),
};

// eslint-disable-next-line func-style
export function AppendingPreparation(props: Props) {
  const gen = generateTestId(props.testid);

  const Inward = <Issue issue={props.inward} placeholder={props.inward === undefined} />;

  return (
    <ul className={Styles.root} data-testid={gen("unroller")}>
      {Inward}
      <RelationArrow draft />
      <Issue placeholder />
    </ul>
  );
}
