import classNames from "classnames";
import { SelectComponents, SelectOption } from "./type";
import { Option } from "./option";
import { BaseProps, generateTestId } from "@/components/helper";

export interface OptionContainerProps extends BaseProps {
  /**
   * an option to render option
   */
  readonly option: SelectOption;

  /**
   * callback when option selected
   */
  readonly onSelect: (option: SelectOption) => void;

  readonly components: SelectComponents;
}

const Styles = {
  root: classNames(
    "flex",
    "flex-auto",
    "cursor-pointer",
    "px-3",
    "py-2",
    "transition-colors",
    "text-sm",
    "hover:bg-complement-200/50",
  ),
} as const;

// eslint-disable-next-line func-style
export function OptionContainer(props: OptionContainerProps) {
  const gen = generateTestId(props.testid);

  const handleClick = () => {
    props.onSelect(props.option);
  };

  const Display = props.components.option ?? Option;

  return (
    <div className={Styles.root} onMouseDown={handleClick} data-testid={gen(`option-container-${props.option.label}`)}>
      <Display option={props.option} />
    </div>
  );
}
