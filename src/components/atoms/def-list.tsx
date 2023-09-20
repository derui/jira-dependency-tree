import React, { PropsWithChildren } from "react";
import classNames from "classnames";
import { BaseProps } from "../helper";

export interface Props extends BaseProps, PropsWithChildren {}

const Styles = {
  root: classNames("flex", "flex-col", "gap-2"),
} as const;

export const DefList: React.FC<Props> = (props) => {
  return (
    <dl className={Styles.root} data-testid={props.testid}>
      {props.children}
    </dl>
  );
};
