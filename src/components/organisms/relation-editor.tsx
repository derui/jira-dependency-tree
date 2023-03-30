import React, { useRef, useState } from "react";
import classNames from "classnames";
import { BaseProps, classes, generateTestId } from "../helper";
import { Issue } from "../molecules/issue";
import { useAppDispatch, useAppSelector } from "../hooks";
import { Button } from "../atoms/button";
import { Icon } from "../atoms/icon";
import { Suggestor } from "../molecules/suggestor";
import { IssueKey, Loading } from "@/type";
import {
  queryCurrentRelatedIssuesWithKind,
  RelationKind,
  selectSelectedIssueKey,
} from "@/state/selectors/relation-editor";
import { selectMatchedIssueModel } from "@/state/selectors/issues";
import { addRelation, attentionIssue, removeRelation, searchIssue } from "@/state/actions";
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
  main: classes("flex", "flex-col", "flex-auto", "p-2", "h-full", "overflow-hidden"),
  issueList: classes("overflow-y-scroll", "space-y-2", "h-full", "pr-2", "hover:scroll-auto", "scroll-smooth"),
  skeleton: classes("flex-auto", "m-2", "h-full", "animate-pulse", "bg-lightgray"),
  appender: classes("flex", "mb-2"),
  appenderButton: classes("flex", "flex-row", "items-center"),
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

const IssueAppender: React.FC<{
  testid: string;
  dispatch: AppDispatch;
  issueKey: string;
  kind: RelationKind;
  relatedIssues: IssueKey[];
}> = ({ testid, dispatch, issueKey, kind, relatedIssues }) => {
  const gen = generateTestId(testid);
  const parentElement = useRef<HTMLDivElement | null>(null);
  const [searching, setSearching] = useState(false);
  const allIssues = useAppSelector(selectMatchedIssueModel());
  const suggestions = allIssues
    .filter((issue) => issue.key !== issueKey && !relatedIssues.includes(issue.key))
    .map((issue) => {
      return { id: issue.key, value: issue.key, displayName: `${issue.key} ${issue.summary}` };
    });

  const handleSelect = (key: string) => {
    setSearching(false);
    dispatch(searchIssue(""));

    if (kind === "inward") {
      dispatch(addRelation({ fromKey: key, toKey: issueKey }));
    } else {
      dispatch(addRelation({ fromKey: issueKey, toKey: key }));
    }
  };

  return (
    <div ref={parentElement} className={classNames(Styles.appender)}>
      {searching ? (
        <Suggestor
          focusOnInit={true}
          testid={gen("suggestion-list")}
          suggestions={suggestions}
          placeholder="Input issue key/summary"
          onConfirmed={handleSelect}
          onEmptySuggestion={(term) => dispatch(searchIssue(term))}
        />
      ) : (
        <Button size="full" schema='gray' testid={gen("add-button")} onClick={() => setSearching(!searching)}>
          <span className={classNames(Styles.appenderButton)}>
            <Icon type="plus" color="gray" />
            Add
          </span>
        </Button>
      )}
    </div>
  );
};

// eslint-disable-next-line func-style
export function RelationEditor(props: Props) {
  const gen = generateTestId(props.testid);
  const [loading, relatedIssues = []] = useAppSelector(queryCurrentRelatedIssuesWithKind(props.kind));
  const selectedIssueKey = useAppSelector(selectSelectedIssueKey());
  const dispatch = useAppDispatch();
  const relatedIssueKeys = relatedIssues.map(([, v]) => v.key);

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
    <Issue
      key={issue.key}
      loading={loading}
      issue={issue}
      onClick={(key) => dispatch(attentionIssue(key))}
      onDelete={handleIssueDeleted}
      testid={gen("issue")}
    />
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
          <IssueAppender
            testid={gen("appender")}
            relatedIssues={relatedIssueKeys}
            dispatch={dispatch}
            issueKey={selectedIssueKey}
            kind={props.kind}
          />
          <ul className={classNames(Styles.issueList)}>{issueList}</ul>
        </main>
      )}
    </div>
  );
}
