import { Icon, BaseIconProps } from "./_base";

type Props = Omit<BaseIconProps, "iconType">;

export const LayoutDistributeHorizontal = function LayoutDistributeHorizontal(props: Props) {
  const { testid, size, color } = props;

  return <Icon iconType="layout-distribute-horizontal" {...{ testid, size, color }} />;
};
