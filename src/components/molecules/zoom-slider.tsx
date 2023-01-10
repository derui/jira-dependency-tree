import React from "react";
import classNames from "classnames";
import { BaseProps, classes, generateTestId } from "../helper";

export interface Props extends BaseProps {
  zoom: number;
}

const Styles = {
  root: classes("absolute", "flex", "right-4", "bottom-4", "p-4", "bg-white", "z-10"),
  currentZoom: classes("inline-block", "text-center"),
};

export const ZoomSlider: React.FC<Props> = ({ zoom, testid }) => {
  const gen = generateTestId(testid);

  return (
    <div className={classNames(Styles.root)}>
      <span className={classNames(Styles.currentZoom)} data-testid={gen("current-zoom")}>{`${Math.round(zoom)}%`}</span>
    </div>
  );
};
