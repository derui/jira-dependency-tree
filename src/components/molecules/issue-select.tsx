import classNames from "classnames";
import { BaseProps } from "../helper";
import { OptionProps, Select, SelectOption } from "../atoms/select";
import { IssueModel } from "@/view-models/issue";
import { stringToColour } from "@/utils/color";

export interface Props extends BaseProps {
  readonly issues?: ReadonlyArray<IssueModel>;
  readonly onSelect?: (issue: IssueModel) => void;
}

const Styles = {
  option: {
    root: classNames("flex", "flex-1", "flex-row", "items-center", "overflow-hidden"),
    issueType: (issueType: string | undefined) => {
      const color = stringToColour(issueType ?? "");

      return classNames("flex-none", "w-3", "h-3", "mr-2", "border", `bg-[${color}]`);
    },
    summary: classNames("w-full", "overflow-hidden", "text-ellipsis", "whitespace-nowrap"),
  },
};

const IssueOption = (props: OptionProps) => {
  const issue = props.option.value as IssueModel;

  return (
    <div className={Styles.option.root}>
      <div className={Styles.option.issueType(issue.issueType?.name)}></div>
      <div className={Styles.option.summary}>{props.option.label}</div>
    </div>
  );
};

// eslint-disable-next-line func-style
export function IssueSelect(props: Props) {
  const options = (props.issues ?? []).map((v) => ({ label: v.summary, value: v }));

  const handleChange = (option: SelectOption) => {
    if (props.onSelect) {
      props.onSelect(option.value as IssueModel);
    }
  };

  return <Select options={options} onChange={handleChange} components={{ option: IssueOption }} />;
}
