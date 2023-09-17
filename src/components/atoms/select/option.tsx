import { SelectOption } from "./type";
import { BaseProps } from "@/components/helper";

export interface OptionProps extends BaseProps {
  /**
   * an option to render option
   */
  readonly option: SelectOption;
}

// eslint-disable-next-line func-style
export function Option(props: OptionProps) {
  return <>{props.option.label}</>;
}
