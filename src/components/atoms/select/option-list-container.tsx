import classNames from "classnames";
import { SelectComponents, SelectOption } from "./type";
import { OptionContainer } from "./option-container";
import { BaseProps, generateTestId } from "@/components/helper";

export interface OptionContainerProps extends BaseProps {
  /**
   * display list or not
   */
  readonly shown?: boolean;

  /**
   * options to render list
   */
  readonly options: ReadonlyArray<SelectOption>;

  /**
   * callback when option selected
   */
  readonly onSelect: (option: SelectOption) => void;

  /**
   * components
   */
  readonly components: SelectComponents;
}

const Styles = {
  root: (shown: boolean) =>
    classNames("flex", "flex-col", "rounded", "border", "border-secondary1-300", "w-full", "py-1", "shadow-lg", {
      hidden: !shown,
    }),

  noOption: classNames("flex-auto", "text-center", "text-gray", "px-3", "py-2", "bg-white"),
};

// eslint-disable-next-line func-style
export function OptionListContainer(props: OptionContainerProps) {
  const gen = generateTestId(props.testid);

  if (props.options.length === 0) {
    return (
      <div className={Styles.root(props.shown ?? false)} data-testid={gen("root")}>
        <div className={Styles.noOption}>No Options</div>
      </div>
    );
  }

  return (
    <div className={Styles.root(props.shown ?? false)} data-testid={gen("root")}>
      {props.options.map((opt) => (
        <OptionContainer key={opt.label} option={opt} onSelect={props.onSelect} components={props.components} />
      ))}
    </div>
  );
}
