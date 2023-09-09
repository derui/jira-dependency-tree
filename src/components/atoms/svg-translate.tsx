import { PropsWithChildren } from "react";
import { BaseProps, generateTestId } from "../helper";

interface Props extends BaseProps {
  x?: number;
  y?: number;
}

// eslint-disable-next-line func-style
export function Translate(props: PropsWithChildren<Props>) {
  const gen = generateTestId(props.testid);
  const { x, y } = props;

  if (x === undefined && y === undefined) {
    return props.children;
  }

  return (
    <g transform={`translate(${x}, ${y})`} data-testid={gen("translate")}>
      {props.children}
    </g>
  );
}
