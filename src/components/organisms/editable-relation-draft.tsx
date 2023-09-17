import classNames from "classnames";
import { BaseProps, generateTestId } from "../helper";
import { Issue } from "../molecules/issue";
import { RelationArrow } from "../molecules/relation-arrow";
import { Button } from "../atoms/button";
import { ArrowBack } from "../atoms/icons";
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
  undoButton: classNames("absolute", "-left-36"),

  arrowWithUndo: classNames("flex", "flex-row", "items-center", "justify-center", "relative"),
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
    const outward = delta.kind === "append" ? delta.outwardIssue : delta.relation.outward;

    return (
      <ul className={Styles.touchedRoot()} data-testid={gen("touched")}>
        <Issue issue={inward} testid={gen("inward")} />
        <ul className={Styles.arrowWithUndo}>
          <span className={Styles.undoButton}>
            <Button schema="primary" size="s" onClick={handleClick} testid={gen("undo")}>
              <ArrowBack color="primary" />
              Undo
            </Button>
          </span>
          <RelationArrow draft={delta.kind === "delete"} />
        </ul>
        <Issue issue={outward} testid={gen("outward")} />
      </ul>
    );
  } else {
    const delta = draft.relation;
    const handleClick = onRequestDelete ? () => onRequestDelete(delta.relationId) : undefined;

    return (
      <ul className={Styles.root} data-testid={gen("no-touched")}>
        <Issue issue={delta.inward} testid={gen("inward")} />
        <RelationArrow onClick={handleClick} testid={gen("arrow")} />
        <Issue issue={delta.outward} testid={gen("outward")} />
      </ul>
    );
  }
}
