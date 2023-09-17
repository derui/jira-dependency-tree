import classNames from "classnames";
import { useState } from "react";
import { BaseProps, generateTestId } from "../helper";
import { SearchInput } from "../molecules/search-input";
import { Button } from "../atoms/button";
import { Panel } from "../molecules/panel";
import { Plus } from "../atoms/icons";
import { EditableRelationDraft } from "./editable-relation-draft";
import { AppendingPreparation } from "./appending-preparation";
import { useRelationEditor } from "@/hooks/relation-editor";
import { useRelationFiltering } from "@/hooks/relation-filtering";
import { IssueKey } from "@/type";

export interface Props extends BaseProps {
  opened?: boolean;
  onClose?: () => void;
}

const Styles = {
  root: classNames("h-1/2", "flex", "flex-col", "w-full", "px-3", "overflow-hidden", "flex-auto"),
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
  main: classNames(
    "flex",
    "flex-col",
    "flex-auto",
    "m-2",
    "h-full",
    "overflow-hidden",
    "overflow-y-auto",
    "space-y-2",
    "pr-2",
    "scroll-smooth",
  ),
  skeleton: classNames("flex-auto", "m-2", "h-full", "animate-pulse", "bg-lightgray"),
  footer: classNames("flex-none", "py-2"),

  appender: {
    root: classNames(
      "rounded",
      "mt-3",
      "p-4",
      "border-4",
      "border-dashed",
      "border-primary-300",
      "hover:bg-primary-200/20",
      "cursor-pointer",
      "transition",
    ),
    text: classNames("flex", "flex-row", "text-primary-400", "items-center", "justify-center"),
  },
  preparation: {
    root: classNames("mt-3"),
  },
};

// eslint-disable-next-line func-style
function Appender(props: { show?: boolean; onClick?: () => void; testid: string }) {
  const gen = generateTestId(props.testid);
  if (!props.show) {
    return null;
  }

  return (
    <div className={Styles.appender.root} onClick={props.onClick} data-testid={gen("root")}>
      <p className={Styles.appender.text}>
        <Plus color="primary" />
        Click to add relation
      </p>
    </div>
  );
}

// eslint-disable-next-line func-style
function Preparation(props: {
  show?: boolean;
  testid: string;
  onAppend: (inward: IssueKey, outward: IssueKey) => void;
  onCancel: () => void;
}) {
  if (!props.show) {
    return null;
  }

  return (
    <div className={Styles.preparation.root}>
      <AppendingPreparation onAppend={props.onAppend} onCancel={props.onCancel} testid={props.testid} />
    </div>
  );
}

// eslint-disable-next-line func-style
export function RelationEditor(props: Props) {
  const gen = generateTestId(props.testid);
  const { state, remove, undo, append, apply, isLoading } = useRelationEditor();
  const { filter, clear } = useRelationFiltering();
  const [showAppendDraft, setShowAppendDraft] = useState(false);

  const handleAppend = (inward: IssueKey, outward: IssueKey) => {
    setShowAppendDraft(false);
    append(inward, outward);
  };

  const draftList = state.drafts.map((draft) => {
    const key = draft.kind === "Touched" ? `delta-${draft.delta.deltaId}` : `nontouched-${draft.relation.relationId}`;
    return (
      <EditableRelationDraft key={key} draft={draft} onUndo={undo} onRequestDelete={remove} testid={gen("draft")} />
    );
  });

  return (
    <Panel opened={props.opened} onClose={props.onClose} title="Relations" testid={gen("panel")}>
      <div className={Styles.root} data-testid={gen("root")}>
        <div className={Styles.header} data-testid={gen("title")}>
          <SearchInput onSearch={filter} onCancel={clear} testid={gen("search-input")} />
        </div>
        <Appender
          show={!showAppendDraft}
          onClick={() => {
            setShowAppendDraft(true);
          }}
          testid={gen("appender")}
        />
        <Preparation
          show={showAppendDraft}
          onCancel={() => setShowAppendDraft(false)}
          onAppend={handleAppend}
          testid={gen("preparation")}
        />
        <div className={Styles.main}>{draftList}</div>
        <div className={Styles.footer}>
          <Button
            type="normal"
            size="full"
            schema="secondary2"
            disabled={!state.appliable || isLoading}
            onClick={apply}
          >
            Apply drafts
          </Button>
        </div>
      </div>
    </Panel>
  );
}
