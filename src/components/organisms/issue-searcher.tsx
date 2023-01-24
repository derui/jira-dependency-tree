import React, { useEffect, useState } from "react";
import classNames from "classnames";
import { BaseProps, classes, generateTestId } from "../helper";
import { useAppDispatch, useAppSelector } from "../hooks";
import { Icon } from "../atoms/icon";
import { Issue } from "../molecules/issue";
import { isSyncable, selectMatchedIssueModel } from "@/state/selectors/issues";
import { focusIssueOnSearch, searchIssue } from "@/state/actions";

export type Props = BaseProps;

type Status = "Searching" | "Prepared" | "BeforePrepared";

const Styles = {
  root: classes("flex", "flex-col", "bg-white", "rounded", "px-3", "mr-3", "shadow-md", "max-w-sm", "relative"),
  opener: classes("flex-none", "w-6", "h-6", "items-center", "justify-center", "flex"),
  input: classes("flex-[1_1_60%]", "w-full", "outline-none", "pl-2"),
  cancel: (status: Status) => {
    return {
      ...classes("flex-none", "w-6", "h-6", "flex"),
      ...(status === "Searching" ? classes() : classes("hidden")),
    };
  },
  inputWrapper: (status: Status) => {
    return {
      ...classes("flex-1", "overflow-hidden", "transition-width"),
      ...(status === "Searching" ? classes("w-64") : classes("w-0")),
    };
  },
  searcher: classes("h-12", "flex", "items-center", "justify-center"),
  issue: classes(
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
  issueKey: classes("text-gray", "flex-none"),
  issueSummary: classes("font-sm", "flex-none", "w-full", "overflow-hidden", "text-ellipsis", "whitespace-nowrap"),
  issueList: (haveIssues: boolean) => {
    return {
      ...classes(
        "max-h-64",
        "overflow-y-auto",
        "shadow-lg",
        "p-2",
        "mt-2",
        "flex",
        "flex-col",
        "absolute",
        "top-12",
        "right-0",
        "w-96",
        "bg-white",
      ),
      ...(haveIssues ? classes() : classes("hidden")),
    };
  },
};

export const IssueSearcher: React.FC<Props> = (props) => {
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
    dispatch(focusIssueOnSearch(key));
  };

  const issueList = matchedIssues.map((issue) => (
    <Issue key={issue.key} issue={issue} onClick={(key) => handleIssueClick(key)} testid={gen("issue")} />
  ));

  return (
    <div className={classNames(Styles.root)} data-testid={gen("root")}>
      <div className={classNames(Styles.searcher)}>
        <span className={classNames(Styles.opener)}>
          <button
            type='button'
            data-testid={gen("opener")}
            aria-disabled={status === "BeforePrepared"}
            onClick={handleOpenerClicked}
          >
            <Icon type='search' color='complement' active={status === "Searching"} />
          </button>
        </span>
        <span
          className={classNames(Styles.inputWrapper(status))}
          aria-hidden={status !== "Searching"}
          data-testid={gen("input-wrapper")}
        >
          <input
            className={classNames(Styles.input)}
            type='text'
            placeholder='Search Term'
            value={term}
            onChange={(e) => handleTermInputted(e.target.value)}
            data-testid={gen("input")}
          />
        </span>
        <span className={classNames(Styles.cancel(status))}>
          <button data-testid={gen("cancel")} onClick={handleCancelClicked}>
            <Icon type='x' color='primary' active={!!term} />
          </button>
        </span>
      </div>
      <ul className={classNames(Styles.issueList(issueList.length > 0))} data-testid={gen("issue-list")}>
        {issueList}
      </ul>
    </div>
  );
};
