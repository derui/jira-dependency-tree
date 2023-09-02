import React, { useRef, useState } from "react";
import classNames from "classnames";
import { BaseProps, generateTestId } from "../helper";
import { iconize } from "../atoms/iconize";
import { IssueSearcher } from "./issue-searcher";
import { EditableRelationDraft } from "./editable-relation-draft";
import { useRelationEditor } from "@/hooks/relation-editor";

export type Props = BaseProps;

const Styles = {
  root: classNames("h-1/2", "flex", "flex-col", "w-full", "px-3", "overflow-hidden"),
  header: classNames(
    "h-16",
    "text-secondary1-500",
    "flex",
    "text-lg",
    "items-center",
    "flex-none",
    "border-b",
    "border-b-secondary2-400",
  ),
  main: classNames("flex", "flex-col", "flex-auto", "p-2", "h-full", "overflow-hidden"),
  issueList: classNames("overflow-y-scroll", "space-y-2", "h-full", "pr-2", "hover:scroll-auto", "scroll-smooth"),
  skeleton: classNames("flex-auto", "m-2", "h-full", "animate-pulse", "bg-lightgray"),
  appender: classNames("flex", "mb-2"),
  appenderButton: classNames("flex", "flex-row", "items-center", "w-full", iconize({ type: "plus", color: "gray" })),
};

// eslint-disable-next-line func-style
export function RelationEditor(props: Props) {
  const gen = generateTestId(props.testid);
  const { state, remove, undo } = useRelationEditor();

  const draftList = state.drafts.map((draft) => {
    return <EditableRelationDraft draft={draft} onUndo={undo} onRequestDelete={remove} />;
  });

  return (
    <div className={classNames(Styles.root)} data-testid={gen("root")}>
      <div className={classNames(Styles.header)} data-testid={gen("title")}>
        <IssueSearcher />
      </div>
      <div className={classNames(Styles.main)}>{draftList}</div>
    </div>
  );
}
