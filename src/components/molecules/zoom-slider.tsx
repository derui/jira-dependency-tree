import classNames from "classnames";
import { BaseProps, generateTestId } from "../helper";

export interface Props extends BaseProps {
  zoom: number;
}

const Styles = {
  root: classNames("absolute", "flex", "right-4", "bottom-4", "p-4", "bg-white", "z-10", "w-20", "text-center"),
  currentZoom: classNames("inline-block", "text-center", "w-full"),
};

// eslint-disable-next-line func-style
export function ZoomSlider({ zoom, testid }: Props) {
  const gen = generateTestId(testid);

  return (
    <div className={Styles.root}>
      <span className={Styles.currentZoom} data-testid={gen("current-zoom")}>{`${Math.round(zoom)}%`}</span>
    </div>
  );
}
