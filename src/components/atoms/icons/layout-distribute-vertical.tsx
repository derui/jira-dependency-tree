import { Icon, BaseIconProps } from "./_base";

type Props = Omit<BaseIconProps, "iconType">;

export const LayoutDistributeVertical = function LayoutDistributeVertical(props: Props) {
  const { testid, size, color } = props;

  return <Icon iconType="layout-distribute-vertical" {...{ testid, size, color }} />;
};
