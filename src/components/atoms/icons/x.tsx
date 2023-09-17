import { Icon, BaseIconProps } from "./_base";

type Props = Omit<BaseIconProps, "iconType">;

export const X = function X(props: Props) {
  const { testid, size, color } = props;

  return <Icon iconType="x" {...{ testid, size, color }} />;
};
