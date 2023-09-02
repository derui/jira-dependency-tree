import classNames from "classnames";
import { BaseProps, generateTestId } from "../helper";
import { iconize } from "../atoms/iconize";
import { SearchInput } from "../molecules/search-input";
import { Button } from "../atoms/button";
import { EditableRelationDraft } from "./editable-relation-draft";
import { AppendingPreparation } from "./appending-preparation";
import { useRelationEditor } from "@/hooks/relation-editor";
import { IssueModel } from "@/view-models/issue";
import { useRelationFiltering } from "@/hooks/relation-filtering";

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
  main: classNames(
    "flex",
    "flex-col",
    "flex-auto",
    "p-2",
    "h-full",
    "overflow-hidden",
    "overflow-y-scroll",
    "space-y-2",
    "h-full",
    "pr-2",
    "hover:scroll-auto",
    "scroll-smooth",
  ),
  skeleton: classNames("flex-auto", "m-2", "h-full", "animate-pulse", "bg-lightgray"),
  appenderButton: classNames("flex", "flex-row", "items-center", "w-full", iconize({ type: "plus", color: "gray" })),
  footer: classNames("flex-none"),

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
    icon: classNames(iconize({ type: "plus", active: true })),
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
        <span className={Styles.appender.icon} />
        Click to add relation
      </p>
    </div>
  );
}

// eslint-disable-next-line func-style
function Preparation(props: { show?: boolean; inward?: IssueModel; testid: string }) {
  const gen = generateTestId(props.testid);
  if (!props.show) {
    return null;
  }

  return (
    <div className={Styles.preparation.root} data-testid={gen("root")}>
      <AppendingPreparation inward={props.inward} />
    </div>
  );
}

// eslint-disable-next-line func-style
export function RelationEditor(props: Props) {
  const gen = generateTestId(props.testid);
  const { state, remove, undo, startPreparationToAdd, apply } = useRelationEditor();
  const { filter, clear } = useRelationFiltering();

  const draftList = state.drafts.map((draft) => {
    const key = draft.kind === "Touched" ? `delta-${draft.delta.deltaId}` : `nontouched-${draft.relation.relationId}`;
    return (
      <EditableRelationDraft key={key} draft={draft} onUndo={undo} onRequestDelete={remove} testid={gen("draft")} />
    );
  });

  return (
    <div className={Styles.root} data-testid={gen("root")}>
      <div className={Styles.header} data-testid={gen("title")}>
        <SearchInput onSearch={filter} onCancel={clear} testid={gen("search-input")} />
      </div>
      <Appender show={state.preparationToAdd === undefined} onClick={startPreparationToAdd} testid={gen("appender")} />
      <Preparation
        show={state.preparationToAdd !== undefined}
        inward={state.preparationToAdd?.inward}
        testid={gen("preparation")}
      />
      <div className={Styles.main}>{draftList}</div>
      <div className={Styles.footer}>
        <Button type="normal" size="full" schema="secondary2" disabled={!state.appliable} onClick={apply}>
          Apply drafts
        </Button>
      </div>
    </div>
  );
}
