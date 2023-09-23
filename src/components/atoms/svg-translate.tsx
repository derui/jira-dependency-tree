import { PropsWithChildren } from "react";
import { BaseProps, generateTestId } from "../helper";

interface Props extends BaseProps {
  x?: number;
  y?: number;
  doNotPropagateMouseEvents?: boolean;
}

// eslint-disable-next-line func-style
export function Translate(props: PropsWithChildren<Props>) {
  const gen = generateTestId(props.testid);
  const { x, y, doNotPropagateMouseEvents } = props;

  if (x === undefined && y === undefined) {
    return props.children;
  }

  // do not propagate wheel event
  const handleWheel = (e: React.WheelEvent) => {
    if (doNotPropagateMouseEvents) {
      e.stopPropagation();
    }
  };

  const handleMouseEvents = (e: React.MouseEvent) => {
    if (doNotPropagateMouseEvents) {
      e.stopPropagation();
    }
  };

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onMouseUp={handleMouseEvents}
      onMouseDown={handleMouseEvents}
      onClick={handleMouseEvents}
      onMouseMove={handleMouseEvents}
      onWheelCapture={handleWheel}
      data-testid={gen("translate")}
    >
      {props.children}
    </g>
  );
}
