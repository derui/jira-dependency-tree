import { Icon, BaseIconProps } from "./_base";

type Props = Omit<BaseIconProps, "iconType">;

export const ChevronDown = function ChevronDown(props: Props) {
  const { testid, size, color } = props;

  return <Icon iconType="chevron-down" {...{ testid, size, color }} />;
};
