import classNames from "classnames";
import { BaseProps } from "../helper";
import { SyncIssueButton } from "../organisms/sync-issue-button";
import { IssueSetModal } from "../organisms/issue-set-modal";

export type Props = BaseProps;

const Styles = {
  root: classNames("flex", "flex-row", "bg-white", "shadow-md", "justify-center", "items-center", "px-2"),
  iconContainer: classNames("flex", "ml-2", "w-8", "h-8", "items-center", "first-of-type:"),
};

// eslint-disable-next-line func-style
export function TopToolbar(props: Props) {
  return (
    <div className={Styles.root} data-testid={props.testid}>
      <IssueSetModal testid="issue-set" />
      <SyncIssueButton testid="sync-issue-button" />
    </div>
  );
}
