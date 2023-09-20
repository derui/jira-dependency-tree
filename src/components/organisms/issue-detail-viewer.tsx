import classNames from "classnames";
import { BaseProps, generateTestId } from "../helper";
import { Translate } from "../atoms/svg-translate";
import { IssueDetail } from "../molecules/issue-detail";
import { IconButton } from "../atoms/icon-button";
import { X } from "../atoms/icons";
import { useSelectNode } from "@/hooks";
import { IssueModelWithLayout } from "@/view-models/graph-layout";

export interface Props extends BaseProps {
  readonly layout: IssueModelWithLayout;
}

const Styles = {
  foreign: classNames("relative", "shadow-lg"),
  root: classNames(
    "relative",
    "border",
    "border-secondary1-300",
    "rounded",
    "w-full",
    "h-full",
    "overflow-y-auto",
    "px-3",
  ),
  closer: classNames("absolute", "right-4", "top-1"),
} as const;

const Consts = {
  X_OFFSET: 12,
  Y_OFFSET: 24,
  SIZE: {
    width: 360,
    height: 300,
  },
} as const;

// eslint-disable-next-line func-style
export function IssueDetailViewer(props: Props) {
  const gen = generateTestId(props.testid);
  const { deselect } = useSelectNode();
  const position = {
    x: props.layout.position.x + Consts.X_OFFSET,
    y: props.layout.position.y + Consts.Y_OFFSET - props.layout.size.height,
  };

  return (
    <Translate {...position}>
      <foreignObject width={Consts.SIZE.width} height={Consts.SIZE.height} className={Styles.foreign}>
        <div className={Styles.root}>
          <IssueDetail issue={props.layout.issue} testid={gen(`issue-${props.layout.issue.key}`)} />
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
