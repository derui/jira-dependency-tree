import React, { useRef, useState } from "react";
import classNames from "classnames";
import { dispatch } from "d3";
import { BaseProps, classes, generateTestId } from "../helper";
import { Issue } from "../molecules/issue";
import { useAppDispatch, useAppSelector } from "../hooks";
import { Button } from "../atoms/button";
import { Icon } from "../atoms/icon";
import { Input } from "../atoms/input";
import { SuggestionList } from "../molecules/suggestion-list";
import { Loading } from "@/type";
import {
  queryCurrentRelatedIssuesWithKind,
  RelationKind,
  selectSelectedIssueKey,
} from "@/state/selectors/relation-editor";
import { selectMatchedIssueModel } from "@/state/selectors/issues";
import { addRelation, removeRelation, searchIssue } from "@/state/actions";
import { AppDispatch } from "@/state/store";

export interface Props extends BaseProps {
  kind: RelationKind;
}

const Styles = {
  root: classes(
    "h-1/2",
    "flex",
    "flex-col",
    "w-full",
    "px-3",
    "first-of-type:border-b",
    "first-of-type:border-b-secondary2-400",
    "overflow-hidden",
  ),
  header: classes("h-8", "text-secondary1-500", "flex", "text-lg", "items-center", "flex-none"),
  main: classes("flex-auto", "p-2", "h-full", "overflow-hidden"),
  issueList: classes("overflow-y-scroll", "space-y-2", "h-full", "pr-2", "hover:scroll-auto", "scroll-smooth"),
  skeleton: classes("flex-auto", "p-2", "h-full", "animate-pulse", "bg-lightgray"),
};

const kindToTitle = (kind: RelationKind) => {
  switch (kind) {
    case "inward":
      return "Inward issues";
    case "outward":
      return "Outward issues";
  }
};

const Skeleton: React.FC<{ testid: string }> = ({ testid }) => {
  return <main className={classNames(Styles.skeleton)} data-testid={testid} />;
};

const IssueAppender: React.FC<{ testid: string; dispatch: AppDispatch; issueKey: string; kind: RelationKind }> = ({
  testid,
  dispatch,
  issueKey,
  kind,
}) => {
  const gen = generateTestId(testid);
  const parentElement = useRef<HTMLDivElement | null>(null);
  const [searching, setSearching] = useState(false);
  const [term, setTerm] = useState("");
  const allIssues = useAppSelector(selectMatchedIssueModel());
  const suggestions = allIssues
    .filter((issue) => issue.key !== issueKey)
    .map((issue) => {
      return { id: issue.key, value: issue.key, displayName: `${issue.key} ${issue.summary}` };
    });

  const handleTermInput = (term: string) => {
    setTerm(term);
    dispatch(searchIssue(term));
  };

  const handleKeypress = (key: string) => {
    if (key === "Enter") {
      setTerm("");
      setSearching(false);
      dispatch(searchIssue(""));

      if (kind === "inward") {
        dispatch(addRelation({ fromKey: key, toKey: issueKey }));
      } else {
        dispatch(addRelation({ fromKey: issueKey, toKey: key }));
      }
    }
  };

  const handleSelect = () => {};

  return (
    <div ref={parentElement}>
      {searching ? (
        <>
          <Input
            value={term}
            onInput={handleTermInput}
            onKeypress={handleKeypress}
            placeholder="Input issue key/summary"
            testid={gen("issue-term")}
          />
          <SuggestionList
            testid={gen("suggestion-list")}
            opened={true}
            suggestions={suggestions}
            suggestionIdSelected=""
            parentElement={parentElement.current ?? undefined}
            onSelect={handleSelect}
          />
        </>
      ) : (
        <Button schema="primary" testid={gen("add-button")} onClick={() => setSearching(!searching)}>
          <span>
            <Icon type="plus" color="gray" />
            Add
          </span>
        </Button>
      )}
    </div>
  );
};

export const RelationEditor: React.FC<Props> = (props) => {
  const gen = generateTestId(props.testid);
  const [loading, relatedIssues = []] = useAppSelector(queryCurrentRelatedIssuesWithKind(props.kind));
  const selectedIssueKey = useAppSelector(selectSelectedIssueKey());
  const dispatch = useAppDispatch();

  const handleIssueDeleted = (key: string) => {
    if (!selectedIssueKey) {
      return;
    }

    if (props.kind === "inward") {
      dispatch(removeRelation({ fromKey: key, toKey: selectedIssueKey }));
    } else {
      dispatch(removeRelation({ fromKey: selectedIssueKey, toKey: key }));
    }
  };

  const issueList = relatedIssues.map(([loading, issue]) => (
    <Issue key={issue.key} loading={loading} issue={issue} onDelete={handleIssueDeleted} testid={gen("issue")} />
  ));

  return (
    <div className={classNames(Styles.root)} data-testid={gen("root")}>
      <header className={classNames(Styles.header)} data-testid={gen("title")}>
        {kindToTitle(props.kind)}
      </header>
      {loading === Loading.Loading || !selectedIssueKey ? (
        <Skeleton testid={gen("skeleton")} />
      ) : (
        <main className={classNames(Styles.main)}>
          <IssueAppender testid={gen("appender")} dispatch={dispatch} issueKey={selectedIssueKey} kind={props.kind} />
          <ul className={classNames(Styles.issueList)}>{issueList}</ul>
        </main>
      )}
    </div>
  );
};
