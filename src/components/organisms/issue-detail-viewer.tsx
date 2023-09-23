import classNames from "classnames";
import { BaseProps, generateTestId } from "../helper";
import { Translate } from "../atoms/svg-translate";
import { IssueDetail } from "../molecules/issue-detail";
import { IconButton } from "../atoms/icon-button";
import { X } from "../atoms/icons";
import { useRemoveNode, useSelectNode } from "@/hooks";
import { IssueModelWithLayout } from "@/view-models/graph-layout";

export interface Props extends BaseProps {
  readonly layout: IssueModelWithLayout;
}

const Styles = {
  foreign: classNames("relative", "bg-white"),
  root: classNames(
    "relative",
    "border",
    "border-complement-300",
    "rounded",
    "w-full",
    "h-full",
    "overflow-y-auto",
    "px-3",
    "py-2",
  ),
  closer: classNames("absolute", "right-4", "top-1"),
} as const;

const Consts = {
  X_OFFSET: 12,
  Y_OFFSET: 36,
  SIZE: {
    width: 360,
    height: 300,
  },
  LINE_LENGTH: 24,
  RADIUS: 6,
} as const;

// eslint-disable-next-line func-style
export function IssueDetailViewer(props: Props) {
  const gen = generateTestId(props.testid);
  const { deselect } = useSelectNode();
  const { remove } = useRemoveNode();
  const position = {
    x: props.layout.position.x,
    y: props.layout.position.y - Consts.Y_OFFSET - Consts.SIZE.height,
  };

  const line = {
    x1: Consts.X_OFFSET,
    x2: Consts.X_OFFSET,
    y1: Consts.SIZE.height + Consts.Y_OFFSET,
    y2: Consts.SIZE.height,
  };

  const handleRemove = remove;

  return (
    <Translate {...position} testid={gen("root")}>
      <circle cx={line.x1} cy={line.y1} r={Consts.RADIUS} className="fill-complement-300" />
      <line {...line} className="stroke-complement-300" />
      <foreignObject width={Consts.SIZE.width} height={Consts.SIZE.height} className={Styles.foreign}>
        <div className={Styles.root}>
          <IssueDetail
            issue={props.layout.issue}
            testid={gen(`issue-${props.layout.issue.key}`)}
            onRemove={handleRemove}
          />
        </div>
        <span className={Styles.closer}>
          <IconButton color="gray" onClick={() => deselect(props.layout.issue.key)} testid={gen("closer")}>
            <X />
          </IconButton>
        </span>
      </foreignObject>
    </Translate>
  );
}
