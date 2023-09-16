import classNames from "classnames";
import { SelectOption } from "./type";
import { BaseProps, generateTestId } from "@/components/helper";

export interface OptionContainerProps extends BaseProps {
  /**
   * an option to render option
   */
  option: SelectOption;

  /**
   * callback when option selected
   */
  onSelect: (option: SelectOption) => void;
}

const Styles = {
  root: classNames("cursor-pointer", "px-3", "py-2", "transition-colors", "text-sm", "hover:bg-complement-200/50"),
} as const;

// eslint-disable-next-line func-style
export function OptionContainer(props: OptionContainerProps) {
  const gen = generateTestId(props.testid);

  const handleClick = () => {
    props.onSelect(props.option);
  };

  return (
    <div className={Styles.root} onMouseDown={handleClick} data-testid={gen(`option-container-${props.option.label}`)}>
      {props.option.label}
    </div>
  );
}
