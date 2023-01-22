import React from "react";
import classNames from "classnames";
import { BaseProps, classes, generateTestId } from "../helper";
import { Issue, IssueModel } from "../molecules/issue";
import { useAppDispatch, useAppSelector } from "../hooks";
import { Loading } from "@/type";
import {
  queryCurrentRelatedIssuesWithKind,
  RelationKind,
  selectSelectedIssueKey,
} from "@/state/selectors/relation-editor";
import { queryIssueModels } from "@/state/selectors/issues";
import { removeRelation } from "@/state/actions";

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

export const RelationEditor: React.FC<Props> = (props) => {
  const gen = generateTestId(props.testid);
  const [loading, allIssues] = useAppSelector(queryIssueModels());
  const [, relatedIssues = []] = useAppSelector(queryCurrentRelatedIssuesWithKind(props.kind));
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
      {loading === Loading.Loading ? (
        <Skeleton testid={gen("skeleton")} />
      ) : (
        <main className={classNames(Styles.main)}>
          <ul className={classNames(Styles.issueList)}>{issueList}</ul>
        </main>
      )}
    </div>
  );
};
