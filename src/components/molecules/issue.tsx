import React from "react";
import classNames from "classnames";
import { BaseProps, generateTestId } from "../helper";
import { iconize } from "../atoms/iconize";
import { IssueStatus, IssueType } from "@/type";
import { stringToColour, stringToHighContrastColor } from "@/util/color";
import { IssueModel } from "@/view-models/issue";

export interface Props extends BaseProps {
  issue?: IssueModel;
  loading?: boolean;
  selected?: boolean;
  onDelete?: (key: string) => void;
  onClick?: (key: string) => void;
  placeholder?: boolean;
}

const Styles = {
  root: (clickable: boolean, selected: boolean) => {
    return classNames(
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
      "bg-white",
      {
        "cursor-pointer": clickable,
      },
      {
        "bg-gradient-to-r": selected,
        "from-complement-200/10": selected,
        "to-complement-200/10": selected,
      },
    );
  },
  placeholderRoot: () => {
    return classNames(
      "h-16",
      "flex",
      "flex-col",
      "rounded",
      "border-2",
      "border-dashed",
      "border-primary-200",
      "px-4",
      "py-2",
      "transition",
      "bg-primary-200/10",
      "justify-center",
      "items-center",
    );
  },
  placeholderText: classNames("font-bold", "text-primary-100"),

  summary: classNames("text-sm", "mb-2"),
  information: classNames("flex", "flex-row", "items-center", "space-x-2", "w-full"),
  issueType: classNames("w-3", "h-3", "inline-block", "overflow-hidden"),
  issueStatus: (category?: string) => {
    const base = stringToColour(category ?? "");
    const highContrast = stringToHighContrastColor(category ?? "");

    return classNames("inline-block", "px-2", "py-1", "text-sm", `bg-[${base}]`, `text-[${highContrast}]`, "text-bold");
  },
  key: classNames("mx-3"),
  skeletonRoot: classNames(
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
  skeletonSummary: classNames("w-full", "h-6", "bg-lightgray", "flex-auto"),
  skeletonType: classNames("w-3", "h-3", "bg-lightgray", "flex-none"),
  skeletonKey: classNames("w-16", "h-3", "bg-lightgray", "flex-none"),
  skeletonStatus: classNames("w-8", "h-3", "bg-lightgray", "flex-none"),
  deleteButton: classNames(
    "rounded",
    "flex",
    "absolute",
    "h-5",
    "w-5",
    "border",
    "border-transparent",
    "hover:border-lightgray",
    "right-1",
    "top-1",
    "transition",
    "items-center",
    iconize({ type: "x", color: "primary", size: "s" }),
  ),
};

// eslint-disable-next-line func-style
function IssueKeyDisplay({ value, testid }: { value: string; testid: string }) {
  return (
    <span className={classNames(Styles.key)} data-testid={testid}>
      {value}
    </span>
  );
}

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

const DeleteButton: React.FC<{ onClick: () => void; testid: string }> = ({ onClick, testid }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    onClick();
  };

  return <button className={classNames(Styles.deleteButton)} data-testid={testid} onClick={handleClick}></button>;
};

// eslint-disable-next-line func-style
export function Issue(props: Props) {
  const gen = generateTestId(props.testid);
  const { issue, onClick, loading, onDelete, selected, placeholder } = props;

  const handleClick = (e: React.MouseEvent) => {
    if (onClick && issue) {
      e.preventDefault();
      e.stopPropagation();

      onClick(issue.key);
    }
  };

  const handleDelete = () => {
    if (onDelete && issue) {
      onDelete(issue.key);
    }
  };

  if (placeholder) {
    return (
      <li className={classNames(Styles.placeholderRoot())} data-testid={gen("root-draft")}>
        <span className={classNames(Styles.placeholderText)}>Waiting to set issue...</span>
      </li>
    );
  }

  if (loading || !issue) {
    return (
      <li className={classNames(Styles.skeletonRoot)} data-testid={gen("root-skeleton")}>
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
    <li
      className={classNames(Styles.root(!!onClick, !!selected))}
      onClick={handleClick}
      data-testid={gen("root")}
      data-selected={!!selected}
    >
      <span className={classNames(Styles.summary)} data-testid={gen("summary")}>
        {issue.summary}
      </span>
      <span className={classNames(Styles.information)} data-testid={gen("information")}>
        <IssueTypeDisplay value={issue.issueType} testid={gen("type")} />
        <IssueKeyDisplay value={issue.key} testid={gen("key")} />
        <IssueStatusDisplay value={issue.issueStatus} testid={gen("status")} />
      </span>

      {onDelete ? <DeleteButton onClick={handleDelete} testid={gen("delete")} /> : null}
    </li>
  );
}
