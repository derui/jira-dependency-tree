import { BaseProps, generateTestId } from "../helper";
import { LinkLayoutModel } from "@/view-models/graph-layout";

export interface Props extends BaseProps {
  layout: LinkLayoutModel;
}

// eslint-disable-next-line func-style
export function LinkNode(props: Props) {
  const gen = generateTestId(props.testid);

  return (
    <path
      d={props.layout.pathCommands}
      fill="none"
      className="stroke-secondary1-300"
      markerEnd="url(#arrowhead)"
      data-testid={gen(`link-${props.layout.meta.relationId}`)}
    />
  );
}
