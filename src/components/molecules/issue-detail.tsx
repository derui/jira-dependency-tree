import React from "react";
import classNames from "classnames";
import { BaseProps, generateTestId } from "../helper";
import { DefList } from "../atoms/def-list";
import { DefItem } from "../atoms/def-item";
import { Button } from "../atoms/button";
import { IconButton } from "../atoms/icon-button";
import { X } from "../atoms/icons";
import { stringToColour } from "@/utils/color";
import { IssueKey, IssueType } from "@/type";
import { IssueModel } from "@/view-models/issue";

export interface Props extends BaseProps {
  issue: IssueModel;
  onDelete?: (key: IssueKey) => void;
  onClose?: () => void;
}

const Styles = {
  root: classNames("relative"),
  issueType: (issueType?: IssueType) => {
    const color = stringToColour(issueType?.name ?? "");

    return classNames("inline-block", "w-3", "h-3", `bg-[${color}]`, "mr-2");
  },
  container: classNames("overflow-y-auto"),
  operations: classNames(
    "flex",
    "flex-row",
    "items-center",
    "sticky",
    "bottom-0",
    "pt-2",
    "border-t",
    "border-t-secondary1-200",
  ),
  operation: classNames("flex", "flex-row", "items-center"),
  closer: classNames("absolute", "right-2", "top-0"),
} as const;

export const IssueDetail: React.FC<Props> = (props) => {
  const { issue, testid } = props;
  const gen = generateTestId(testid);

  const handleDelete = () => props.onDelete?.(issue.key);

  const handleClose = () => props.onClose?.();

  return (
    <div className={Styles.root}>
      <span className={Styles.closer}>
        <IconButton color="gray" onClick={handleClose} testid={gen("closer")}>
          <X />
        </IconButton>
      </span>
      <div className={Styles.container}>
        <DefList testid={gen("deflist")}>
          <DefItem label="Type" testid={gen("issue-type")}>
            <span className={Styles.issueType(issue.issueType)} />
            {issue.issueType?.name ?? ""}
          </DefItem>
          <DefItem label="Key" testid={gen("key")}>
            {issue.key}
          </DefItem>
          <DefItem label="Summary" testid={gen("summary")}>
            {issue.summary}
          </DefItem>
          <DefItem label="Issue Status" testid={gen("status")}>
            {issue.issueStatus?.name}
          </DefItem>
        </DefList>
      </div>
      <ul className={Styles.operations}>
        <li className={Styles.operation}>
          <Button schema="primary" type="normal" size="s" onClick={handleDelete} testid={gen("deleter")}>
            Delete
          </Button>
        </li>
      </ul>
    </div>
  );
};
