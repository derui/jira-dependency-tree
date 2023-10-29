import classNames from "classnames";
import { BaseProps, generateTestId } from "../helper";
import { QueryInput } from "../molecules/query-input";
import { Issue } from "../molecules/issue";
import { Panel } from "../molecules/panel";
import { useFilterIssues } from "@/hooks/filter-issues";
import { useFocusIssue } from "@/hooks/focus-issue";
import { IssueKey } from "@/type";
import { IssueModel } from "@/view-models/issue";

export interface Props extends BaseProps {
  opened?: boolean;
  onClose?: () => void;
}

const Styles = {
  root: classNames("mt-2"),
  issueList: classNames("flex", "flex-col", "mx-3", "my-2", "gap-2"),
  empty: classNames("mx-3", "my-2", "p-4", "bg-complement-200/20", "rounded", "text-center"),
} as const;

// eslint-disable-next-line func-style
function IssueDisplayList(props: { issues: IssueModel[]; testid: string; onIssueClick: (key: IssueKey) => void }) {
  const gen = generateTestId(props.testid);

  if (props.issues.length == 0) {
    return <div className={Styles.empty}>No issues</div>;
  }

  const issueList = props.issues.map((issue) => (
    <Issue key={issue.key} issue={issue} onClick={props.onIssueClick} testid={gen("issue")} />
  ));

  return (
    <ul className={classNames(Styles.issueList)} data-testid={gen("root")}>
      {issueList}
    </ul>
  );
}

// eslint-disable-next-line func-style
export function IssueList(props: Props) {
  const gen = generateTestId(props.testid);
  const { state, filter, clear } = useFilterIssues();
  const focus = useFocusIssue();

  const handleSearch = (term: string) => {
    filter(term);
  };

  const handleIssueClick = (key: IssueKey) => {
    focus(key);
  };

  return (
    <Panel opened={props.opened} title="Issues in graph" onClose={props.onClose}>
      <div className={Styles.root} data-testid={gen("root")}>
        <QueryInput onSearch={handleSearch} testid={gen("input")} incremental placeholder="Filtering Issues" />
        <IssueDisplayList issues={state.issues} onIssueClick={handleIssueClick} testid={gen("issue-list")} />
      </div>
    </Panel>
  );
}
