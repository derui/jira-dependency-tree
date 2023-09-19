import React, { PropsWithChildren } from "react";
import classNames from "classnames";
import { BaseProps, generateTestId } from "../helper";

export interface Props extends BaseProps, PropsWithChildren {
  label: string;
}

const Styles = {
  root: classNames("flex", "flex-col"),
  title: classNames("flex", "flex-none", "text-sm", "items-center", "text-darkgray"),
  description: classNames(
    "flex-1",
    "pl-3",
    "py-1",
    "items-center",
    "border-b",
    "border-b-secondary1-200",
    "break-words",
  ),
} as const;

export const DefItem: React.FC<Props> = (props) => {
  const gen = generateTestId(props.testid);

  return (
    <div className={Styles.root} data-testid={gen("root")}>
      <dt className={Styles.title} data-testid={gen("title")}>
        {props.label}
      </dt>
      <dd className={Styles.description} data-testid={gen("item")}>
        {props.children}
      </dd>
    </div>
  );
};
