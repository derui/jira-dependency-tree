import classNames from "classnames";
import { SelectComponents, SelectOption } from "./type";
import { OptionContainer } from "./option-container";
import { BaseProps, generateTestId } from "@/components/helper";

export interface OptionContainerProps extends BaseProps {
  /**
   * display list or not
   */
  shown?: boolean;

  /**
   * options to render list
   */
  options: SelectOption[];

  /**
   * callback when option selected
   */
  onSelect: (option: SelectOption) => void;

  /**
   * components
   */
  components: SelectComponents;
}

const Styles = {
  root: (shown: boolean) =>
    classNames("flex", "flex-col", "rounded", "border", "border-secondary1-300", "w-full", {
      hidden: !shown,
    }),
};

// eslint-disable-next-line func-style
export function OptionListContainer(props: OptionContainerProps) {
  const gen = generateTestId(props.testid);
  const Container = props.components.optionContainer ?? OptionContainer;

  return (
    <div className={Styles.root(props.shown ?? false)} data-testid={gen("option-list-container")}>
      {props.options.map((opt) => (
        <Container key={opt.label} option={opt} onSelect={props.onSelect} />
      ))}
    </div>
  );
}
