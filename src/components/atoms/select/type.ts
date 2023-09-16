import { Completion } from "./completion";
import { Indicators } from "./indicators";
import { Option } from "./option";
import { OptionListContainer } from "./option-list-container";

export type SelectOption = {
  label: string;
  value: unknown;
};

/**
 * component list for select
 */
export type SelectComponents = {
  option?: typeof Option;
  optionListContainer?: typeof OptionListContainer;
  completion?: typeof Completion;
  indicators?: typeof Indicators;
};
