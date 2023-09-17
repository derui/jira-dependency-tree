import classNames from "classnames";
import { ChevronDown } from "../icons";
import { BaseProps, generateTestId } from "@/components/helper";

export interface IndicatorsProps extends BaseProps {
  /**
   * focused or not
   */
  readonly focused?: boolean;

  /**
   * selected some option
   */
  readonly selected?: boolean;

  /**
   * callback when reset indicator clicked
   */
  readonly onReset?: () => void;
}

type StyleOption = Readonly<{
  selected: boolean;
  focused: boolean;
}>;

const Styles = {
  root: () => classNames("flex", "flex-row", "items-center"),
  dropDown: classNames("flex", "flex-1", "mx-2"),
  divider: (options: StyleOption) =>
    classNames("flex-1", "py-3", "border-l", "border-l-lightgray", {
      "border-l-secondary1-300": options.focused,
    }),
};

// eslint-disable-next-line func-style
export function Indicators(props: IndicatorsProps) {
  const gen = generateTestId(props.testid);
  const styleOption = { focused: props.focused ?? false, selected: props.selected ?? false };

  return (
    <div className={Styles.root()} data-testid={gen("indicator")}>
      <div className={Styles.divider(styleOption)}> </div>
      <div className={Styles.dropDown} data-testid={gen("drop-down")}>
        <ChevronDown color={styleOption.focused ? "secondary1" : "gray"} />
      </div>
    </div>
  );
}
