import { BaseProps, generateTestId } from "../helper";
import { Translate } from "../atoms/svg-translate";
import { Issue } from "../molecules/issue";
import { IssueModelWithLayout } from "@/view-models/graph-layout";

export interface Props extends BaseProps {
  layout: IssueModelWithLayout;
}

// eslint-disable-next-line func-style
export function IssueNode(props: Props) {
  const gen = generateTestId(props.testid);
  return (
    <g pointerEvents="none">
      <Translate {...props.layout.position}>
        <foreignObject width={props.layout.size.width} height={props.layout.size.height}>
          <Issue issue={props.layout.issue} testid={gen("issue")} />
        </foreignObject>
      </Translate>
    </g>
  );
}
