import classNames from "classnames";
import { BaseProps, generateTestId } from "../helper";
import { useHighlightLinkNode } from "@/hooks/issue-graph/highlight-link-node";
import { LinkLayoutModel } from "@/view-models/graph-layout";
import { HighlightState } from "@/type";

export interface Props extends BaseProps {
  layout: LinkLayoutModel;
}

const Styles = {
  root: (status: HighlightState) =>
    classNames("stroke-secondary1-300", "transition-opacity", {
      "opacity-20": status === "obscured",
    }),
} as const;

// eslint-disable-next-line func-style
export function LinkNode(props: Props) {
  const gen = generateTestId(props.testid);
  const highlight = useHighlightLinkNode(props.layout.meta.relationId);

  return (
    <path
      d={props.layout.pathCommands}
      fill="none"
      className={Styles.root(highlight)}
      markerEnd="url(#arrowhead)"
      data-testid={gen(`link-${props.layout.meta.relationId}`)}
    />
  );
}
