import { useState } from "react";
import classNames from "classnames";
import { BaseProps, generateTestId } from "../helper";
import { Issue } from "../molecules/issue";
import { SearchInput } from "../molecules/search-input";
import { useFilterIssues } from "@/hooks/filter-issues";
import { useFocusIssue } from "@/hooks/focus-issue";
import { IssueKey } from "@/type";

export type Props = BaseProps;

const Styles = {
  root: classNames(
    "flex",
    "flex-col",
    "bg-white",
    "rounded",
    "px-3",
    "mr-3",
    "shadow-md",
    "relative",
    "flex-none",
    "h-12",
    "max-w-fit",
  ),
  issueList: (haveIssues: boolean) => {
    return classNames(
      "max-h-64",
      "overflow-y-auto",
      "shadow-lg",
      "p-2",
      "mt-2",
      "flex",
      "flex-col",
      "absolute",
      "top-12",
      "left-0",
      "w-96",
      "bg-white",
      "space-y-2",
      {
        hidden: !haveIssues,
      },
    );
  },
};

// eslint-disable-next-line func-style
export function IssueSearcher(props: Props) {
  const gen = generateTestId(props.testid);
  const { state, filter, clear } = useFilterIssues();
  const focus = useFocusIssue();
  const [listOpened, setListOpened] = useState(false);

  const handleSearch = (term: string) => {
    filter(term);
    setListOpened(true);
  };

  const handleCancel = () => {
    clear();
    setListOpened(false);
  };

  const handleIssueClick = (key: IssueKey) => {
    focus(key);
  };

  const issueList = state.issues.map((issue) => (
    <Issue key={issue.key} issue={issue} onClick={handleIssueClick} testid={gen("issue")} />
  ));

  return (
    <div className={Styles.root} data-testid={gen("root")}>
      <SearchInput onSearch={handleSearch} onCancel={handleCancel} testid={gen("input")} />
      <ul
        className={classNames(Styles.issueList(issueList.length > 0 && listOpened))}
        aria-hidden={issueList.length === 0 || !listOpened}
        data-testid={gen("issue-list")}
      >
        {issueList}
      </ul>
    </div>
  );
}
