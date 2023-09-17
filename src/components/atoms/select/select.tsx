import { PropsWithChildren, useRef, useState } from "react";
import classNames from "classnames";
import { BaseProps, generateTestId } from "../../helper";
import { iconize } from "../iconize";
import { SelectComponents, SelectOption } from "./type";
import { Option } from "./option";
import { Completion } from "./completion";
import { OptionListContainer } from "./option-list-container";
import { Indicators } from "./indicators";

export interface SelectProps extends PropsWithChildren, BaseProps {
  /**
   * options to display
   */
  readonly options: ReadonlyArray<SelectOption>;

  /**
   * callback after change value
   */
  readonly onChange?: (option: SelectOption) => void;

  /**
   * disable element
   */
  readonly disabled?: boolean;

  /**
   * components for select
   */
  readonly components?: SelectComponents;
}

type StyleOption = {
  focused: boolean;
};

type SelectOpeningStatus = "notFocused" | "opened" | "selected";

const Styles = {
  root: (options: StyleOption) =>
    classNames("relative", "flex", "rounded", "border", "border-lightgray", "transition-[border-color]", {
      "border-secondary1-300": options.focused,
    }),
  completionContainer: classNames("flex", "flex-row", "flex-auto", "items-center"),
  dropDown: (options: StyleOption) =>
    classNames(
      "flex",
      "flex-1",
      "mx-2",
      iconize({ type: "chevron-down", color: options.focused ? "secondary1" : "gray", active: options.focused }),
    ),
  completionDivider: (options: StyleOption) =>
    classNames("flex-1", "py-3", "border-l", "border-l-lightgray", {
      "border-l-secondary1-300": options.focused,
    }),
  optionContainerWrapper: (el: HTMLDivElement | null) => {
    if (el) {
      const rect = el.getBoundingClientRect();

      return classNames("absolute", `left-0`, `top-[calc(${rect.bottom}px)]`, `w-[${rect.width}px]`, `max-w-72`);
    } else {
      return classNames("absolute");
    }
  },
} as const;

const defaultComponents = {
  option: Option,
  optionListContainer: OptionListContainer,
  completion: Completion,
  indicators: Indicators,
} satisfies SelectComponents;

// eslint-disable-next-line func-style
export function Select(props: SelectProps) {
  const gen = generateTestId(props.testid);
  // hooks
  const rootRef = useRef<HTMLDivElement>(null);
  const [selectedOption, setSelectedOption] = useState<SelectOption | null>(null);
  const [filteredOptions, setFilteredOptions] = useState<SelectOption[]>(props.options);
  const [focused, setFocused] = useState<SelectOpeningStatus>("notFocused");

  // local variables
  const components = {
    ...defaultComponents,
    ...Object.fromEntries(Object.entries(props.components ?? {}).filter(([, v]) => v !== undefined)),
  };
  const labels = props.options.map((v) => v.label);

  // handlers
  const handleFilterLabel = (labels: string[]) => {
    setFilteredOptions(props.options.filter(({ label }) => labels.includes(label)));
  };
  const handleSelect = (option: SelectOption) => {
    setSelectedOption(option);
    setFocused("selected");
  };
  const handleReset = () => {
    setSelectedOption(null);
  };
  const handleBlur = () => {
    setFocused("notFocused");
  };

  const styleOption = { focused: focused !== "notFocused" };

  return (
    <div
      ref={rootRef}
      className={Styles.root(styleOption)}
      onFocus={() => setFocused("opened")}
      onBlur={handleBlur}
      data-testid={gen("select-root")}
    >
      <div className={Styles.completionContainer}>
        <components.completion
          labels={labels}
          onFilterLabel={handleFilterLabel}
          selectedLabel={selectedOption?.label}
          testid={gen("completions")}
        />
        <components.indicators
          focused={focused !== "notFocused"}
          selected={selectedOption !== null}
          onReset={handleReset}
          testid={gen("indicators")}
        />
      </div>
      <div className={Styles.optionContainerWrapper(rootRef.current)}>
        <components.optionListContainer
          options={filteredOptions}
          onSelect={handleSelect}
          shown={focused === "opened"}
          components={components}
          testid={gen("option-list-container")}
        />
      </div>
    </div>
  );
}
