import classNames from "classnames";
import { BaseProps, classes, generateTestId } from "../helper";

export interface Props extends BaseProps {
  zoom: number;
}

const Styles = {
  root: classes("absolute", "flex", "right-4", "bottom-4", "p-4", "bg-white", "z-10", "w-20", "text-center"),
  currentZoom: classes("inline-block", "text-center", "w-full"),
};

// eslint-disable-next-line func-style
export function ZoomSlider({ zoom, testid }: Props) {
  const gen = generateTestId(testid);

  return (
    <div className={classNames(Styles.root)}>
      <span className={classNames(Styles.currentZoom)} data-testid={gen("current-zoom")}>{`${Math.round(zoom)}%`}</span>
    </div>
  );
}
