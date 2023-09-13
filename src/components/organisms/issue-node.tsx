import { BaseProps, generateTestId } from "../helper";
import { Translate } from "../atoms/svg-translate";
import { Issue } from "../molecules/issue";
import { IssueModelWithLayout } from "@/view-models/graph-layout";
import { useSelectNode } from "@/hooks";

export interface Props extends BaseProps {
  layout: IssueModelWithLayout;
}

// eslint-disable-next-line func-style
export function IssueNode(props: Props) {
  const gen = generateTestId(props.testid);
  const selectNode = useSelectNode();

  return (
    <g data-testid={gen("group")}>
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
