import { Icon, BaseIconProps } from "./_base";

type Props = Omit<BaseIconProps, "iconType">;

export const ChevronRight = function ChevronRight(props: Props) {
  const { testid, size, color } = props;

  return <Icon iconType="chevron-right" {...{ testid, size, color }} />;
};
