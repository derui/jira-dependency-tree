import { useEffect, useState } from "react";
import classNames from "classnames";
import { BaseProps, generateTestId } from "../helper";
import { useAppDispatch, useAppSelector } from "../hooks";
import { Issue } from "../molecules/issue";
import { iconize } from "../atoms/iconize";
import { isSyncable, selectMatchedIssueModel } from "@/state/selectors/issues";
import { attentionIssue, searchIssue } from "@/state/actions";

export type Props = BaseProps;

type Status = "Searching" | "Prepared" | "BeforePrepared";

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
  opener: classNames("flex-none", "w-6", "h-6", "items-center", "justify-center", "flex"),
  input: classNames("flex-[1_1_60%]", "w-full", "outline-none", "pl-2"),
  cancel: (status: Status) => {
    return classNames("flex-none", "w-6", "h-6", "flex", { hidden: status !== "Searching" });
  },
  inputWrapper: (status: Status) => {
    return classNames("flex-1", "overflow-hidden", "transition-width", {
      "w-72": status === "Searching",
      "w-0": status !== "Searching",
    });
  },
  searcher: classNames("h-12", "flex", "items-center", "justify-center"),
  issue: classNames(
    "flex",
    "flex-col",
    "align-center",
    "border-b",
    "last:border-b-0",
    "border-b-secondary1-300/50",
    "transition",
    "py-2",
    "px-2",
    "cursor-pointer",
    "hover:text-secondary1-300",
    "hover:bg-secondary1-200/10",
  ),
  issueKey: classNames("text-gray", "flex-none"),
  issueSummary: classNames("font-sm", "flex-none", "w-full", "overflow-hidden", "text-ellipsis", "whitespace-nowrap"),
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
  searchButton: (searching: boolean) => classNames(iconize({ type: "search", color: "complement", active: searching })),
  cancelButton: (active: boolean) => classNames(iconize({ type: "x", color: "primary", active })),
};

// eslint-disable-next-line func-style
export function IssueSearcher(props: Props) {
  const gen = generateTestId(props.testid);
  const [term, setTerm] = useState("");
  const [status, setStatus] = useState<Status>("BeforePrepared");
  const syncable = useAppSelector(isSyncable());
  const matchedIssues = useAppSelector(selectMatchedIssueModel());
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (syncable) {
      setStatus("Prepared");
    }
  }, [syncable]);

  const handleTermInputted = (term: string) => {
    if (status === "Searching") {
      setTerm(term);
      dispatch(searchIssue(term));
    }
  };

  const handleOpenerClicked = () => {
    if (status !== "BeforePrepared") {
      setStatus("Searching");
    }
  };

  const handleCancelClicked = () => {
    setStatus("Prepared");
    setTerm("");
    dispatch(searchIssue(""));
  };

  const handleIssueClick = (key: string) => {
    dispatch(attentionIssue(key));
  };

  const issueList = matchedIssues.map((issue) => (
    <Issue key={issue.key} issue={issue} onClick={(key) => handleIssueClick(key)} testid={gen("issue")} />
  ));

  return (
    <div className={Styles.root} data-testid={gen("root")}>
      <div className={Styles.searcher}>
        <span className={Styles.opener}>
          <button
            type='button'
            className={Styles.searchButton(status === "Searching")}
            data-testid={gen("opener")}
            aria-disabled={status === "BeforePrepared"}
            onClick={handleOpenerClicked}
          ></button>
        </span>
        <span
          className={Styles.inputWrapper(status)}
          aria-hidden={status !== "Searching"}
          data-testid={gen("input-wrapper")}
        >
          <input
            className={Styles.input}
            type='text'
            placeholder='Search Term'
            value={term}
            onChange={(e) => handleTermInputted(e.target.value)}
            data-testid={gen("input")}
          />
        </span>
        <span className={Styles.cancel(status)}>
          <button
            className={Styles.cancelButton(!!term)}
            data-testid={gen("cancel")}
            onClick={handleCancelClicked}
          ></button>
        </span>
      </div>
      <ul
        className={classNames(Styles.issueList(issueList.length > 0 && status === "Searching"))}
        aria-hidden={issueList.length > 0 && status === "Searching"}
        data-testid={gen("issue-list")}
      >
        {issueList}
      </ul>
    </div>
  );
}
