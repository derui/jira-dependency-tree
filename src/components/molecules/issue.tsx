import React from "react";
import classNames from "classnames";
import { BaseProps, classes, generateTestId } from "../helper";
import { IssueKey, IssueStatus, IssueType, Loading, StatusCategory } from "@/type";
import { stringToColour } from "@/util/color";

export interface IssueModel {
  key: IssueKey;
  summary: string;
  issueStatus?: IssueStatus;
  issueType?: IssueType;
}

export interface Props extends BaseProps {
  issue: IssueModel;
  loading?: Loading;
  onClick?: (key: string) => void;
}

const Styles = {
  root: classes("rounded", "flex", "flex-col", "border", "px-4", "py-2", "border-lightgray"),
  summary: classes("text-sm", "mb-2"),
  information: classes("flex", "flex-row", "items-center", "space-x-2", "w-full"),
  issueType: () => {
    return {
      ...classes("w-3", "h-3", "inline-block", "overflow-hidden"),
    };
  },
  issueStatus: (category?: StatusCategory) => {
    const base = classes("inline-block", "px-2", "py-1", "text-sm");
    switch (category) {
      case "DONE":
        return { ...base, ...classes("bg-complement-200") };
      case "IN_PROGRESS":
        return { ...base, ...classes("bg-secondary1-200", "text-white") };
      case "TODO":
        return { ...base, ...classes("bg-lightgray") };
      default:
        return base;
    }
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

  return <span data-testid={testid} className={classNames(Styles.issueType())} style={{ backgroundColor }}></span>;
};

const IssueStatusDisplay: React.FC<{ value: IssueStatus | undefined; testid: string }> = ({ value, testid }) => {
  return (
    <span data-testid={testid} className={classNames(Styles.issueStatus(value?.statusCategory))}>
      {value?.statusCategory}
    </span>
  );
};

export const Issue: React.FC<Props> = (props) => {
  const gen = generateTestId(props.testid);
  const { issue, onClick, loading } = props;

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
    <li className={classNames(Styles.root)} onClick={handleClick} data-testid={gen("root")}>
      <span className={classNames(Styles.summary)} data-testid={gen("summary")}>
        {issue.summary}
      </span>
      <span className={classNames(Styles.information)} data-testid={gen("information")}>
        <IssueTypeDisplay value={issue.issueType} testid={gen("type")} />
        <IssueKeyDisplay value={issue.key} testid={gen("key")} />
        <IssueStatusDisplay value={issue.issueStatus} testid={gen("status")} />
      </span>
    </li>
  );
};
