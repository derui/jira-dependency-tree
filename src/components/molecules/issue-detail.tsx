import React from "react";
import classNames from "classnames";
import { BaseProps, generateTestId } from "../helper";
import { DefList } from "../atoms/def-list";
import { DefItem } from "../atoms/def-item";
import { Button } from "../atoms/button";
import { stringToColour } from "@/utils/color";
import { IssueKey, IssueType } from "@/type";
import { IssueModel, isLoadingIssueModel } from "@/view-models/issue";

export interface Props extends BaseProps {
  issue: IssueModel;
  onRemove?: (key: IssueKey) => void;
  onClose?: () => void;
}

const Styles = {
  root: classNames("relative", "pt-2", "bg-white"),
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
    "py-2",
    "border-t",
    "border-t-secondary1-200",
    "bg-white",
  ),
  operation: classNames("flex", "flex-row", "items-center"),
} as const;

export const IssueDetail: React.FC<Props> = (props) => {
  const { issue, testid } = props;
  const gen = generateTestId(testid);

  const handleRemove = () => props.onRemove?.(issue.key);

  if (isLoadingIssueModel(issue)) {
    return null;
  }

  return (
    <div className={Styles.root}>
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
          <Button schema="gray" type="normal" size="s" onClick={handleRemove} testid={gen("remover")}>
            Remove from graph
          </Button>
        </li>
      </ul>
    </div>
  );
};
