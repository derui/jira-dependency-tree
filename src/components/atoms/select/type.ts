import { Completion } from "./completion";
import { Indicators } from "./indicators";
import { OptionContainer } from "./option-container";
import { OptionListContainer } from "./option-list-container";

export type SelectOption = {
  label: string;
  value: unknown;
};

/**
 * component list for select
 */
export type SelectComponents = {
  optionContainer?: typeof OptionContainer;
  optionListContainer?: typeof OptionListContainer;
  completion?: typeof Completion;
  indicators?: typeof Indicators;
};
