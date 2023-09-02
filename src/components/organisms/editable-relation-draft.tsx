import classNames from "classnames";
import { BaseProps, generateTestId } from "../helper";
import { Issue } from "../molecules/issue";
import { RelationArrow } from "../molecules/relation-arrow";
import { Button } from "../atoms/button";
import { iconize } from "../atoms/iconize";
import { Draft } from "@/hooks/relation-editor";
import { DeltaId, IssueRelationId } from "@/type";

export interface Props extends BaseProps {
  draft: Draft;
  onUndo?: (deltaId: DeltaId) => void;
  onRequestDelete?: (relationId: IssueRelationId) => void;
}

const Styles = {
  root: classNames("flex", "flex-col", "items-center", "p-2"),
  touchedRoot: () => classNames(Styles.root, "bg-primary-200/10", "relative"),
  undoButton: classNames("absolute", "left-2", "top-2", "group"),
  undoIcon: classNames(iconize({ type: "arrow-back" }), "mr-2"),
};

// eslint-disable-next-line func-style
export function EditableRelationDraft(props: Props) {
  const gen = generateTestId(props.testid);
  const { draft, onUndo, onRequestDelete } = props;

  if (draft.kind === "Touched") {
    const delta = draft.delta;
    const handleClick = onUndo
      ? () => {
          onUndo(delta.deltaId);
        }
      : undefined;
    const inward = delta.kind === "append" ? delta.inwardIssue : delta.relation.inward;
    const outward = delta.kind === "append" ? delta.inwardIssue : delta.relation.outward;

    return (
      <ul className={Styles.touchedRoot()} data-testid={gen("unroller")}>
        <span className={Styles.undoButton}>
          <Button schema="primary" size="s" onClick={handleClick}>
            <span className={Styles.undoIcon} />
            undo
          </Button>
        </span>
        <Issue issue={inward} />
        <RelationArrow draft={delta.kind === "delete"} />
        <Issue issue={outward} />
      </ul>
    );
  } else {
    const delta = draft.relation;
    const handleClick = onRequestDelete ? () => onRequestDelete(delta.relationId) : undefined;

    return (
      <ul className={Styles.root} data-testid={gen("unroller")}>
        <Issue issue={delta.inward} />
        <RelationArrow onClick={handleClick} />
        <Issue issue={delta.outward} />
      </ul>
    );
  }
}
