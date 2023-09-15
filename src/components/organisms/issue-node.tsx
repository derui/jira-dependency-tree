import classNames from "classnames";
import { BaseProps, generateTestId } from "../helper";
import { Translate } from "../atoms/svg-translate";
import { Issue } from "../molecules/issue";
import { IssueModelWithLayout } from "@/view-models/graph-layout";
import { useSelectNode, useHighlightIssueNode } from "@/hooks";
import { HighlightState } from "@/type";

export interface Props extends BaseProps {
  layout: IssueModelWithLayout;
}

const Styles = {
  root: (status: HighlightState) =>
    classNames("transition-opacity", {
      "opacity-20": status === "obscured",
    }),
} as const;

// eslint-disable-next-line func-style
export function IssueNode(props: Props) {
  const gen = generateTestId(props.testid);
  const selectNode = useSelectNode();
  const highlight = useHighlightIssueNode(props.layout.issue.key);

  return (
    <g
      className={Styles.root(highlight.state)}
      data-testid={gen("group")}
      onMouseEnter={highlight.enterHover}
      onMouseLeave={highlight.leaveHover}
    >
      <Translate {...props.layout.position}>
        <foreignObject width={props.layout.size.width} height={props.layout.size.height}>
          <Issue
            issue={props.layout.issue}
            testid={gen(`issue-${props.layout.issue.key}`)}
            onClick={selectNode.select}
          />
        </foreignObject>
      </Translate>
    </g>
  );
}
