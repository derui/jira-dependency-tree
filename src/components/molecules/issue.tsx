import React from "react";
import classNames from "classnames";
import { BaseProps, classes, generateTestId } from "../helper";
import { Icon } from "../atoms/icon";
import { IssueStatus, IssueType, Loading, StatusCategory } from "@/type";
import { stringToColour } from "@/util/color";
import { IssueModel } from "@/view-models/issue";

export interface Props extends BaseProps {
  issue: IssueModel;
  loading?: Loading;
  onDelete?: (key: string) => void;
  onClick?: (key: string) => void;
}

const Styles = {
  root: (clickable: boolean) => {
    const base = classes(
      "rounded",
      "flex",
      "flex-col",
      "border",
      "hover:border-complement-300",
      "px-4",
      "py-2",
      "border-lightgray",
      "relative",
      "transition",
    );

    return {
      ...base,
      "cursor-pointer": clickable,
    };
  },
  summary: classes("text-sm", "mb-2"),
  information: classes("flex", "flex-row", "items-center", "space-x-2", "w-full"),
  issueType: classes("w-3", "h-3", "inline-block", "overflow-hidden"),
  issueStatus: (category?: StatusCategory) => {
    const base = classes("inline-block", "px-2", "py-1", "text-sm");

    return {
      ...base,
      "bg-complement-200": category === "DONE",
      "bg-secondary1-200": category === "IN_PROGRESS",
      "text-white": category === "IN_PROGRESS",
      "bg-lightgray": category === "TODO",
    };
  },
  key: classes("mx-3"),
  skeletonRoot: classes(
    "animate-pulse",
    "flex",
    "h-12",
    "w-full",
    "items-center",
    "px-4",
    "py-2",
    "rounded",
    "border",
    "border-lightgray",
    "flex-col",
    "space-y-2",
  ),
  skeletonSummary: classes("w-full", "h-6", "bg-lightgray", "flex-auto"),
  skeletonType: classes("w-3", "h-3", "bg-lightgray", "flex-none"),
  skeletonKey: classes("w-16", "h-3", "bg-lightgray", "flex-none"),
  skeletonStatus: classes("w-8", "h-3", "bg-lightgray", "flex-none"),
  deleteButton: classes(
    "rounded",
    "flex",
    "absolute",
    "h-5",
    "w-5",
    "border",
    "border-transparent",
    "hover:border-lightgray",
    "right-2",
    "top-1",
    "transition",
    "items-center",
  ),
};

const IssueKeyDisplay: React.FC<{ value: string; testid: string }> = ({ value, testid }) => {
  return (
    <span className={classNames(Styles.key)} data-testid={testid}>
      {value}
    </span>
  );
};

const IssueTypeDisplay: React.FC<{ value: IssueType | undefined; testid: string }> = ({ value, testid }) => {
  const backgroundColor = value ? stringToColour(value.name) : "lightgray";

  return <span data-testid={testid} className={classNames(Styles.issueType)} style={{ backgroundColor }}></span>;
};

const IssueStatusDisplay: React.FC<{ value: IssueStatus | undefined; testid: string }> = ({ value, testid }) => {
  return (
    <span data-testid={testid} className={classNames(Styles.issueStatus(value?.statusCategory))}>
      {value?.statusCategory}
    </span>
  );
};

const DeleteButton: React.FC<{ onDelete: () => void; testid: string }> = ({ onDelete, testid }) => {
  return (
    <button className={classNames(Styles.deleteButton)} data-testid={testid} onClick={onDelete}>
      <Icon color="primary" type="x" size="s" />
    </button>
  );
};

export const Issue: React.FC<Props> = (props) => {
  const gen = generateTestId(props.testid);
  const { issue, onClick, loading, onDelete } = props;

  const handleClick = () => {
    if (onClick) {
      onClick(issue.key);
    }
  };

  if (loading === Loading.Loading) {
    return (
      <li className={classNames(Styles.skeletonRoot)} onClick={handleClick} data-testid={gen("root")}>
        <span className={classNames(Styles.skeletonSummary)}></span>
        <span className={classNames(Styles.information)}>
          <span className={classNames(Styles.skeletonType)}></span>
          <span className={classNames(Styles.skeletonKey)}></span>
          <span className={classNames(Styles.skeletonStatus)}></span>
        </span>
      </li>
    );
  }

  return (
    <li className={classNames(Styles.root(!!onClick))} onClick={handleClick} data-testid={gen("root")}>
      <span className={classNames(Styles.summary)} data-testid={gen("summary")}>
        {issue.summary}
      </span>
      <span className={classNames(Styles.information)} data-testid={gen("information")}>
        <IssueTypeDisplay value={issue.issueType} testid={gen("type")} />
        <IssueKeyDisplay value={issue.key} testid={gen("key")} />
        <IssueStatusDisplay value={issue.issueStatus} testid={gen("status")} />
      </span>

      {onDelete ? <DeleteButton onDelete={() => onDelete(issue.key)} testid={gen("delete")} /> : null}
    </li>
  );
};
