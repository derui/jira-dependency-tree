import React from "react";
import classNames from "classnames";
import { BaseProps, classes, generateTestId } from "../helper";
import { IssueKey, IssueStatus, IssueType, StatusCategory } from "@/type";

export interface IssueModel {
  key: IssueKey;
  summary: string;
  issueStatus?: IssueStatus;
  issueType?: IssueType;
}

export interface Props extends BaseProps {
  issue: IssueModel;
  onClick?: (key: string) => void;
}

const Styles = {
  root: classes(),
  summary: classes(),
  information: classes(),
  issueType: (exists: boolean) => {
    return {
      ...classes(),
      ...(exists ? classes() : classes()),
    };
  },
  issueStatus: (category?: StatusCategory) => {
    const base = classes();
    switch (category) {
      case "DONE":
        return { ...base, ...classes() };
      case "IN_PROGRESS":
        return { ...base, ...classes() };
      case "TODO":
        return { ...base, ...classes() };
      default:
        return { ...base, ...classes() };
    }
  },
};

const IssueKey: React.FC<{ value: string; testid: string }> = ({ value, testid }) => {
  return <span data-testid={testid}>{value}</span>;
};

const IssueType: React.FC<{ value: IssueType | undefined; testid: string }> = ({ value, testid }) => {
  return (
    <span data-testid={testid} className={classNames(Styles.issueType(value?.name === undefined))}>
      {value?.name}
    </span>
  );
};

const IssueStatus: React.FC<{ value: IssueStatus | undefined; testid: string }> = ({ value, testid }) => {
  return (
    <span data-testid={testid} className={classNames(Styles.issueStatus(value?.statusCategory))}>
      {value?.statusCategory}
    </span>
  );
};

export const Issue: React.FC<Props> = (props) => {
  const gen = generateTestId(props.testid);
  const { issue, onClick } = props;

  const handleClick = () => {
    if (onClick) {
      onClick(issue.key);
    }
  };

  return (
    <li className={classNames(Styles.root)} onClick={handleClick} data-testid={gen("root")}>
      <span className={classNames(Styles.summary)} data-testid={gen("summary")}>
        {issue.summary}
      </span>
      <span className={classNames(Styles.information)} data-testid={gen("information")}>
        <IssueType value={issue.issueType} testid={gen("type")} />
        <IssueKey value={issue.key} testid={gen("key")} />
        <IssueStatus value={issue.issueStatus} testid={gen("status")} />
      </span>
    </li>
  );
};
