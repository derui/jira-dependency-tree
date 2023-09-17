import { Completion } from "./completion";
import { Indicators } from "./indicators";
import { Option } from "./option";
import { OptionListContainer } from "./option-list-container";

export type SelectOption = {
  readonly label: string;
  readonly value: unknown;
};

/**
 * component list for select
 */
export type SelectComponents = {
  readonly option?: typeof Option;
  readonly optionListContainer?: typeof OptionListContainer;
  readonly completion?: typeof Completion;
  readonly indicators?: typeof Indicators;
};
