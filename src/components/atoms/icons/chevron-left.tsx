import { Icon, BaseIconProps } from "./_base";

type Props = Omit<BaseIconProps, "iconType">;

export const ChevronLeft = function ChevronLeft(props: Props) {
  const { testid, size, color } = props;

  return <Icon iconType="chevron-left" {...{ testid, size, color }} />;
};
